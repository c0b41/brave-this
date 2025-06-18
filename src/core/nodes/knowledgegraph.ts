import constants from '../../utils/constants'

// Helper Types
interface MetadataItem {
  title: string
  value: string
}

interface Rating {
  name: string
  rating: string
}

interface AvailableOn {
  url: string
  source: string
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
  description: []
  url: string | null
  metadata: MetadataItem[]
  ratings: Rating[]
  available_on: string[]
  images: AvailableOn[]
  links: Links[]

  constructor(private $: any, data: []) {
    this.type = null
    this.title = null
    this.description = []
    this.url = null
    this.metadata = []
    this.ratings = []
    this.available_on = []
    this.images = []
    this.links = []

    this.parseTitle($)
    this.parseDescription($, data)
    this.parseUrl($)
    this.parseType($, data)
    this.parseMetadata($, data)
    this.parseRatings($, data)
    this.parseAvailableOn($)
    this.parseImages($, data)
    this.parseLinks($, data)
  }

  private parseTitle($: any): void {
    const title1 = $(constants.SELECTORS.KNO_PANEL_TITLE).text().trim()
    this.title = title1 || null
  }

  private parseDescription($: any, data: []): void {
    let metadata = data[1].data.body.response.infobox.results[0]

    let desc1 = metadata.description
    let desc2 = metadata.long_desc

    this.description = [desc1, desc2]
  }

  private parseUrl($: any): void {
    const url1 = $(constants.SELECTORS.KNO_PANEL_URL).attr('href')?.trim() || null

    this.url = url1
  }

  private parseType($: any, data: []): void {
    let metadata = data[1].data.body.response.infobox.results[0]

    this.type = metadata.category
  }

  private parseMetadata($: any, data: []): void {
    let metadata = data[1].data.body.response.infobox.results[0]

    if (metadata.attributes.length > 0) {
      metadata.attributes.forEach((element: [key: string, val: string | null]) => {
        const [key, value] = element
        if (value) {
          this.metadata.push({ title: key, value: value })
        }
      })
    }

    $(constants.SELECTORS.KNO_PANEL_METADATA).each((_i: number, el: any) => {
      const key = $(el).find('span.infobox-attr-name').text().trim()
      const value = $(el).find('span.attr-value').text().trim()
      if (value.length) {
        this.metadata.push({ title: key, value })
      }
    })
  }

  private parseRatings($: any, data: []): void {
    let metadata = data[1].data.body.response.infobox.results[0]

    if (metadata.ratings.length > 0) {
      metadata.ratings.map((item: any) => {
        this.ratings.push({ name: item.profile.name, rating: item.ratingValue })
      })
    }
  }

  private parseAvailableOn($: any): void {
    this.available_on = $(constants.SELECTORS.KNO_PANEL_AVAILABLE_ON)
      .map((_i: number, el: any) => $(el).text().trim())
      .get()
  }

  private parseImages($: any, data: []): void {
    let metadata = data[1].data.body.response.infobox.results[0]

    if (metadata.images.length > 0) {
      this.images = metadata.images.map((image: any) => {
        return {
          url: image.src,
          source: null,
        }
      })
    }

    this.images = $(constants.SELECTORS.KNO_PANEL_IMAGES)
      .map((_i: number, elem: any) => {
        const url = $(elem).attr('src')?.trim()
        const source = $(elem).parent().parent().parent().parent().parent().attr('data-lpage')?.trim() ?? null
        return url ? { url, source } : null
      })
      .get()
      .filter((img: any): img is { url: string; source?: string } => Boolean(img?.url))
  }

  private parseLinks($: any, data: []): void {
    let metadata = data[1].data.body.response.infobox.results[0]

    if (metadata.profiles.length > 0) {
      this.links = metadata.profiles.map((profile: any) => {
        return {
          url: profile.url,
          name: profile.name,
          icon: profile.img,
        }
      })
    }

    this.links = $(constants.SELECTORS.KNO_PANEL_SOCIALS)
      .map((_i: number, el: any) => {
        const name = $(el).attr('aria-label').trim()
        const url = $(el).attr('href')?.trim()
        const icon = $(el).find('img').attr('src')?.trim()
        return name && url && icon ? { name, url, icon } : null
      })
      .get()
      .filter(Boolean)
  }
}
