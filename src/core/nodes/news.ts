import { RootObject } from '#utils/brave'
import { NewsResult } from '#utils/brave/types'

export interface NewsItem {
  description: string
  url: string
}

export default class News {
  /**
   * Parses top stories from HTML
   */
  static parse($: any, jsData: RootObject): NewsItem[] {
    let data = jsData.data.body.response.news

    let items: NewsItem[] = []

    if (data && data?.results && Array.isArray(data.results) && data.results.length > 0) {
      items = data.results.map((item: NewsResult) => {
        return {
          description: item.description,
          url: item.url,
        }
      })
    }

    return items
  }
}
