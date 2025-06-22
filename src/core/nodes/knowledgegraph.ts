import { RootObject } from '#utils/brave'
import { Thumbnail } from '#utils/brave/types'

// Helper Types
interface MetadataItem {
  title: string
  value: string
}

interface Rating {
  name: string
  rating: string
}

interface Image {
  url: string
  source: string | null
}

interface Links {
  name: string
  url: string
  icon: string
}

// Main Class
export default class KnowledgeGraph {
  type: string | null
  title: string | null
  description: Array<string | undefined>
  url: string | null
  metadata: MetadataItem[]
  ratings: Rating[]
  available_on: string[]
  images: Image[]
  links: Links[]

  constructor(private $: any, jsData: RootObject) {
    this.type = null
    this.title = null
    this.description = []
    this.url = null
    this.metadata = []
    this.ratings = []
    this.available_on = []
    this.images = []
    this.links = []

    this.parseTitle($, jsData)
    this.parseDescription($, jsData)
    this.parseUrl($, jsData)
    this.parseType($, jsData)
    this.parseMetadata($, jsData)
    this.parseRatings($, jsData)
    this.parseAvailableOn($)
    this.parseImages($, jsData)
    this.parseLinks($, jsData)
  }

  private parseTitle($: any, jsData: RootObject): void {
    let metadata = jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic')

    let title = metadata?.title || null
    this.title = title
  }

  private parseDescription($: any, jsData: RootObject): void {
    let metadata = jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic')

    let desc = metadata?.description
    let desc2 = metadata?.long_desc

    this.description = [desc, desc2]
  }

  private parseUrl($: any, jsData: RootObject): void {
    let metadata = jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic')

    this.url = metadata?.website_url || null
  }

  private parseType($: any, jsData: RootObject): void {
    let metadata = jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic')

    this.type = metadata?.category || null
  }

  private parseMetadata($: any, jsData: RootObject): void {
    let metadata = jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic')

    if (metadata?.attributes && Array.isArray(metadata.attributes) && metadata.attributes.length > 0) {
      metadata.attributes.forEach((element: string[]) => {
        const [key, value] = element

        if (value) {
          this.metadata.push({ title: key, value: value })
        }
      })
    }
  }

  private parseRatings($: any, jsData: RootObject): void {
    let metadata = jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic')

    if (metadata?.ratings && Array.isArray(metadata.ratings) && metadata.ratings.length > 0) {
      metadata.ratings.map((item: any) => {
        this.ratings.push({ name: item.profile.name, rating: item.ratingValue })
      })
    }
  }

  // todo ?
  private parseAvailableOn($: any): void {
    //this.available_on = $(constants.SELECTORS.KNO_PANEL_AVAILABLE_ON)
    //  .map((_i: number, el: any) => $(el).text().trim())
    //  .get()
  }

  private parseImages($: any, jsData: RootObject): void {
    let metadata = jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic')

    if (metadata?.images && Array.isArray(metadata.images) && metadata.images.length > 0) {
      this.images = metadata.images.map((image: Thumbnail) => {
        return {
          url: image.src,
          source: null,
        }
      })
    }

    //this.images = $(constants.SELECTORS.KNO_PANEL_IMAGES)
    //  .map((_i: number, elem: any) => {
    //    const url = $(elem).attr('src')?.trim()
    //    const source = $(elem).parent().parent().parent().parent().parent().attr('data-lpage')?.trim() ?? null
    //    return url ? { url, source } : null
    //  })
    //  .get()
    //  .filter((img: any): img is { url: string; source?: string } => Boolean(img?.url))
  }

  private parseLinks($: any, jsData: RootObject): void {
    let metadata = jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic')

    if (metadata?.profiles && Array.isArray(metadata.profiles) && metadata.profiles.length > 0) {
      this.links = metadata.profiles.map((profile: any) => {
        return {
          url: profile.url,
          name: profile.name,
          icon: profile.img,
        }
      })
    }
  }
}
