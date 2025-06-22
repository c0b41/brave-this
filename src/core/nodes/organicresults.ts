import { RootObject } from '#utils/brave'
import { SearchResult } from '#utils/brave/types'
import constants from '#utils/constants'
import { URL } from 'url'

// Define the result interface
interface OrganicResult {
  title: string
  description: string
  url: string
  favicons: {
    high_res: string
    low_res: string
  }
}

export default class OrganicResults {
  static parse($: any, jsData: RootObject): OrganicResult[] {
    let data = jsData.data.body.response.web

    let results: OrganicResult[] = []

    if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
      results = data.results.map((item: SearchResult) => {
        let domain = new URL(item.url || constants.URLS.BRAVE).hostname

        const highResFavicon = `${constants.URLS.FAVICONKIT}/${domain}/192`
        const lowResFavicon = `${constants.URLS.GOOGLE_FAVICON}?sz=64&domain_url=${domain}`

        return {
          title: item.title,
          description: item.description,
          url: item.url,
          favicons: {
            high_res: highResFavicon,
            low_res: lowResFavicon,
          },
        }
      })
    }

    return results
  }
}
