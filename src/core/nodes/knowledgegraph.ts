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

// Interface for the data returned by the parse() method
interface ParsedKnowledgeGraphData {
  type: string | null
  title: string | null
  description: Array<string | undefined>
  url: string | null
  metadata: MetadataItem[]
  ratings: Rating[]
  available_on: string[]
  images: Image[]
  links: Links[]
}

export default class KnowledgeGraph {
  private static _getGenericMetadata(jsData: RootObject): any | null {
    return jsData.data.body.response.infobox?.results.find((item) => item.subtype == 'generic') || null
  }

  private static _getTitle(metadata: any): string | null {
    return metadata?.title || null
  }

  private static _getDescription(metadata: any): Array<string | undefined> {
    const desc = metadata?.description
    const desc2 = metadata?.long_desc
    return [desc, desc2]
  }

  private static _getUrl(metadata: any): string | null {
    return metadata?.website_url || null
  }

  private static _getType(metadata: any): string | null {
    return metadata?.category || null
  }

  private static _getMetadata(metadata: any): MetadataItem[] {
    const items: MetadataItem[] = []
    if (metadata?.attributes && Array.isArray(metadata.attributes) && metadata.attributes.length > 0) {
      metadata.attributes.forEach((element: string[]) => {
        const [key, value] = element
        if (value) {
          items.push({ title: key, value: value })
        }
      })
    }
    return items
  }

  private static _getRatings(metadata: any): Rating[] {
    const ratings: Rating[] = []
    if (metadata?.ratings && Array.isArray(metadata.ratings) && metadata.ratings.length > 0) {
      metadata.ratings.map((item: any) => {
        ratings.push({ name: item.profile.name, rating: item.ratingValue })
      })
    }
    return ratings
  }

  private static _getAvailableOn($: any): string[] {
    // This section was commented out in the original code, suggesting it might involve HTML scraping.
    // If you intend to use it, uncomment and implement the logic using the '$' parameter.
    // For example:
    // return $(constants.SELECTORS.KNO_PANEL_AVAILABLE_ON)
    //   .map((_i: number, el: any) => $(el).text().trim())
    //   .get();
    return [] // Return empty array as per original commented-out status
  }

  private static _getImages(metadata: any): Image[] {
    if (metadata?.images && Array.isArray(metadata.images) && metadata.images.length > 0) {
      return metadata.images.map((image: Thumbnail) => {
        return {
          url: image.src,
          source: null, // Source was consistently null in original images mapping
        }
      })
    }
    return []
  }

  private static _getLinks(metadata: any): Links[] {
    if (metadata?.profiles && Array.isArray(metadata.profiles) && metadata.profiles.length > 0) {
      return metadata.profiles.map((profile: any) => {
        return {
          url: profile.url,
          name: profile.name,
          icon: profile.img,
        }
      })
    }
    return []
  }

  public static parse($: any, jsData: RootObject): ParsedKnowledgeGraphData {
    const genericMetadata = KnowledgeGraph._getGenericMetadata(jsData)

    const parsedData: ParsedKnowledgeGraphData = {
      type: KnowledgeGraph._getType(genericMetadata),
      title: KnowledgeGraph._getTitle(genericMetadata),
      description: KnowledgeGraph._getDescription(genericMetadata),
      url: KnowledgeGraph._getUrl(genericMetadata),
      metadata: KnowledgeGraph._getMetadata(genericMetadata),
      ratings: KnowledgeGraph._getRatings(genericMetadata),
      available_on: KnowledgeGraph._getAvailableOn($),
      images: KnowledgeGraph._getImages(genericMetadata),
      links: KnowledgeGraph._getLinks(genericMetadata),
    }

    return parsedData
  }
}
