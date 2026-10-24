import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'
import type { SearchResult } from '#utils/brave/types'
import constants from '#utils/constants'
import { URL } from 'url'

export interface Sitelink {
  title: string
  url: string
}

export interface OrganicResult {
  title: string
  description: string
  url: string
  favicons: {
    high_res: string
    low_res: string
  }
  /** Human-readable age string from the payload (e.g. "2 hours ago"). */
  age?: string
  /** Sitelinks surfaced by Brave under the snippet (Wikipedia's "Life and career", etc.). */
  sitelinks?: Sitelink[]
}

export function parse(_$: CheerioAPI, jsData: RootObject): OrganicResult[] {
  const data = jsData.data.body.response.web
  if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
    return []
  }

  return data.results.map((item: SearchResult) => {
    let domain = 'unknown'
    try {
      domain = new URL(item.url || constants.URLS.BRAVE).hostname
    } catch {
      /* ignore */
    }

    const result: OrganicResult = {
      title: item.title,
      description: item.description,
      url: item.url,
      favicons: {
        high_res: `${constants.URLS.FAVICONKIT}/${domain}/192`,
        low_res: `${constants.URLS.GOOGLE_FAVICON}?sz=64&domain_url=${domain}`,
      },
    }

    if (item.age) {
      result.age = item.age
    }

    const buttons = item.deep_results?.buttons
    if (Array.isArray(buttons) && buttons.length > 0) {
      result.sitelinks = buttons.map((b) => ({ title: b.title, url: b.url }))
    }

    return result
  })
}

export default { parse }
