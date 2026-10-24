import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'
import type { NewsResult } from '#utils/brave/types'

export interface NewsItem {
  description: string
  url: string
}

export function parse(_$: CheerioAPI, jsData: RootObject): NewsItem[] {
  const data = jsData.data.body.response.news
  if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
    return []
  }
  return data.results.map((item: NewsResult) => ({
    description: item.description,
    url: item.url,
  }))
}

export default { parse }
