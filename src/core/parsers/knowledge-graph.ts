import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'
import type { Thumbnail } from '#utils/brave/types'

export interface MetadataItem {
  title: string
  value: string
}

export interface Rating {
  name: string
  rating: string
}

export interface Image {
  /** Resized/served thumbnail URL (what Brave ships in `images[].src`). */
  url: string
  /** Alt text from the payload. */
  alt?: string
  /** Original (unsized) image URL from the payload. */
  original?: string
  /** Brave-hosted click-through URL for the image lightbox. */
  click_url?: string
  /** True for the entity's logo (rendered as a small icon, not a photo). */
  logo?: boolean
  /** Reserved — some payloads carry the source domain here; Brave's SERP payload doesn't. */
  source: string | null
}

export interface Link {
  name: string
  url: string
  icon: string
}

export interface ParsedKnowledgeGraphData {
  type: string | null
  title: string | null
  description: Array<string | undefined>
  url: string | null
  metadata: MetadataItem[]
  ratings: Rating[]
  available_on: string[]
  images: Image[]
  links: Link[]
  /** Infobox action tabs ("Songs", "Albums", "Movies", "Awards", …). */
  actions: string[]
}

function getGenericMetadata(jsData: RootObject): Record<string, any> | null {
  const infobox = jsData.data.body.response.infobox
  if (!infobox) return null
  return (infobox.results as unknown as Array<Record<string, any>>).find((item) => item.subtype === 'generic') ?? null
}

export function parse(_$: CheerioAPI, jsData: RootObject): ParsedKnowledgeGraphData {
  const metadata = getGenericMetadata(jsData)

  const description = metadata?.long_desc || metadata?.description

  const attributes: MetadataItem[] = []
  if (Array.isArray(metadata?.attributes)) {
    for (const element of metadata!.attributes as string[][]) {
      const [key, value] = element
      if (value) attributes.push({ title: key, value })
    }
  }

  const ratings: Rating[] = []
  if (Array.isArray(metadata?.ratings)) {
    for (const item of metadata!.ratings as any[]) {
      ratings.push({ name: item.profile.name, rating: item.ratingValue })
    }
  }

  const images: Image[] = []
  if (Array.isArray(metadata?.images)) {
    for (const raw of metadata!.images as Array<
      Thumbnail & {
        click_url?: string
        logo?: boolean
      }
    >) {
      const img: Image = { url: raw.src, source: null }
      if (raw.alt) img.alt = raw.alt
      if (raw.original) img.original = raw.original
      if (raw.click_url) img.click_url = raw.click_url
      if (typeof raw.logo === 'boolean') img.logo = raw.logo
      images.push(img)
    }
  }

  const links: Link[] = []
  if (Array.isArray(metadata?.profiles)) {
    for (const profile of metadata!.profiles as any[]) {
      links.push({ url: profile.url, name: profile.name, icon: profile.img })
    }
  }

  const actions: string[] = []
  if (Array.isArray(metadata?.actions)) {
    for (const a of metadata!.actions as Array<{ action?: string }>) {
      if (a?.action) actions.push(a.action)
    }
  }

  return {
    type: metadata?.category ?? null,
    title: metadata?.title ?? null,
    description: description ? [description] : [],
    url: metadata?.website_url ?? null,
    metadata: attributes,
    ratings,
    available_on: [],
    images,
    links,
    actions,
  }
}

export default { parse }
