import { RootObject } from '#utils/brave'
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

export default class Discussions {
  static parse($: any, jsData: RootObject): Discussion[] {
    let discussions: Discussion[] = []

    let data = jsData.data.body.response.discussions

    if (data) {
      discussions = data.results.map((item: any) => {
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

    return discussions
  }
}
