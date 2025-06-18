import constants from '../../utils/constants'

// Define interface for top story item
interface TopStoryItem {
  description: string
  url: string
}

// Main class (mostly just a namespace wrapper)
export default class TopStories {
  /**
   * Parses top stories from HTML
   */
  static parse($: any, data: []): TopStoryItem[] {
    let metadata = data[1].data.body.response.news

    let items: TopStoryItem[] = []

    items = metadata.results.map((item: any) => {
      return {
        description: item.description,
        url: item.url,
      }
    })

    return items
  }
}
