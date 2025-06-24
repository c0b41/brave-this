import { fetchHTML, getHeaders } from '#utils'
import constants from '#utils/constants'
import { UndiciHeaders } from 'undici/types/dispatcher'
import fs from 'fs'

import Dictionary from '#nodes/dictionary'
import DidYouMean from '#nodes/didyoumean'
import KnowledgeGraph from '#nodes/knowledgegraph'
import Location from '#nodes/location'
import News from '#nodes/news'
import OrganicResults from '#nodes/organicresults'
import RelatedQuerys from '#nodes/relatedquery'
import Time from '#nodes/time'
import Translation from '#nodes/translation'
import Videos from '#nodes/videos'
import Weather from '#nodes/weather'
import Converters from '#nodes/converters'
import Discussions from '#nodes/discussions'

export type SearchParams = {
  query: string
  options?: {
    safe?: 'off' | 'moderate' | 'strict'
    search_lang?: string
    page?: number
    mobile?: boolean
    headers?: UndiciHeaders
    //ris?: boolean
    //parse_ads?: boolean
  }
}

export type SearchResult = {
  results: OrganicResults | null
  knowledges: KnowledgeGraph | null
  news: News | null
  videos: Videos | null
  weather: Weather | null
  time: Time | null
  location: Location | null
  dictionary: Dictionary | null
  translation: Translation | null
  units: Converters | null
  didYouMean: DidYouMean | null
  relatedQuerys: RelatedQuerys | null
  discussions: Discussions | null
}

class BraveEngine {
  constructor() {}

  async search({ query, options = {} }: SearchParams) {
    const { safe, search_lang, headers, mobile, page = 0 } = options

    // Build query parameters
    const params = new URLSearchParams({
      q: query,
    })

    if (safe) {
      params.set('safe', safe)
    }

    if (search_lang) {
      params.set('search_lang', search_lang)
    }

    if (page > 0) {
      params.set('offset', String(page * 10))
    }

    const url = `${constants.URLS.BRAVE}?${params.toString()}`

    console.log(`Request URL ${url}`)

    try {
      // Fetch raw HTML
      const html = await fetchHTML({
        url,
        options: {
          //headers: getHeaders({ headers: headers ?? {}, mobile: mobile }),
        },
      })

      fs.writeFileSync('./data/data.html', html)

      return {
        data: html,
      }
    } catch (error: any) {
      throw new Error(`BraveEngine search failed: ${error.message}`)
    }
  }
}

export default BraveEngine
