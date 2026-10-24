import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'
import type { DiscussionResult } from '#utils/brave/types'
import constants from '#utils/constants'

export interface Discussion {
  title: string
  description: string
  url: string
  favicons: {
    high_res: string
    low_res: string
  }
}

export function parse(_$: CheerioAPI, jsData: RootObject): Discussion[] {
  const data = jsData.data.body.response.discussions
  if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
    return []
  }

  return data.results.map((item: DiscussionResult) => {
    let domain = 'unknown'
    try {
      domain = new URL(item.url || constants.URLS.BRAVE).hostname
    } catch {
      /* ignore */
    }

    return {
      title: item.title,
      description: item.description,
      url: item.url,
      favicons: {
        high_res: `${constants.URLS.FAVICONKIT}/${domain}/192`,
        low_res: `${constants.URLS.GOOGLE_FAVICON}?sz=64&domain_url=${domain}`,
      },
    }
  })
}

export default { parse }
