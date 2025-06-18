import constants from '../../utils/constants'
import { URL } from 'url'

// Define the result interface
interface OrganicResult {
  title: string
  description: string
  url: string
  is_sponsored: boolean
  favicons: {
    high_res: string
    low_res: string
  }
}

export default class OrganicResults {
  static parse($: any, parse_ads = false, is_mobile = true): OrganicResult[] {
    const titles = $(constants.SELECTORS.TITLE)
      .map((_i, el) => {
        //const isAd = Reflect.has(el.parent?.parent?.parent?.attribs || {}, 'data-rw') || (!is_mobile && el.parent.attribs?.class?.startsWith('vdQmEd'))
        //
        //if (!parse_ads && isAd) return null

        return $(el).text().trim()
      })
      .get()

    const descriptions = $(constants.SELECTORS.DESCRIPTION)
      .map((_i, el) => {
        return $(el).text().trim()
      })
      .get()

    const urls = $(constants.SELECTORS.URL)
      .map((_i, el) => {
        return $(el).attr('href')
      })
      .get()

    // Adjust arrays if lengths are mismatched
    if (titles.length < urls.length && titles.length < descriptions.length) {
      urls.shift()
    }

    if (urls.length > titles.length) {
      urls.shift()
    }

    const isInaccurateData = descriptions.length < urls.slice(1).length

    urls.forEach((item, index) => {
      if (item?.includes('m.youtube.com') && isInaccurateData) {
        urls.splice(index, 1)
        titles.splice(index, 1)
        index--
      }
    })

    const results: OrganicResult[] = []

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i]
      const description = descriptions[i]
      let url = urls[i]

      //if (url?.startsWith('/aclk') || url?.startsWith('/amp/s')) {
      //  url = `${constants.URLS.BRAVE}${url.substring(1)}`
      //}

      let domain = ''
      try {
        domain = new URL(url || constants.URLS.BRAVE).hostname
      } catch {
        continue
      }

      const highResFavicon = `${constants.URLS.FAVICONKIT}/${domain}/192`
      const lowResFavicon = `${constants.URLS.GOOGLE_FAVICON}?sz=64&domain_url=${domain}`

      if (title && description && url) {
        results.push({
          title,
          description,
          url,
          is_sponsored: false,
          favicons: {
            high_res: highResFavicon,
            low_res: lowResFavicon,
          },
        })
      }
    }

    return []
  }
}
