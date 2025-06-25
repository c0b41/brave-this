import debug from 'debug'
import { fetchHTML, getHeaders } from '#utils'
import constants from '#utils/constants'
import { Headers } from 'undici'
import * as cheerio from 'cheerio'
import { extractJsData, RootObject } from '#utils/brave'
import fs from 'fs/promises'

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
import { SearchError } from '#utils'

const debugBrave = debug('engine')

export type SearchParams = {
  query: string
  options?: {
    safe?: 'off' | 'moderate' | 'strict'
    search_lang?: string
    page?: number
    mobile?: boolean
    headers?: Headers
    // Keep these commented if not actively used, or remove if truly deprecated
    // ris?: boolean;
    // parse_ads?: boolean;
  }
}

export type BraveSearchResult = {
  results: OrganicResults | null
  knowledges: KnowledgeGraph | null
  news: News | null
  videos: Videos | null
  weather: Weather | null
  time: Time | null
  location: Location | null
  dictionary: Dictionary | null
  translation: Translation | null
  converters: Converters | null
  didYouMean: DidYouMean | null
  relatedqueries: RelatedQuerys | null
  discussions: Discussions | null
}

class BraveEngine {
  constructor() {
    debugBrave('BraveEngine instance created.')
  }

  async search({ query, options = {} }: SearchParams): Promise<[cheerio.CheerioAPI, RootObject]> {
    debugBrave(`Initiating search for query: "${query}" with options: %O`, options)

    const { safe, search_lang, headers, mobile, page = 0 } = options

    // Use URL for robust URL building
    const url = new URL(constants.URLS.BRAVE)
    url.searchParams.set('q', query)

    if (safe) {
      url.searchParams.set('safe', safe)
    }

    if (search_lang) {
      url.searchParams.set('search_lang', search_lang)
    }

    if (page > 0) {
      url.searchParams.set('offset', String(page * 10))
    }

    debugBrave(`Constructed request URL: ${url.toString()}`)

    try {
      // Ensure headers are always a Headers instance
      const requestHeaders = getHeaders({
        headers: headers ?? new Headers(), // Provide a new Headers if none are given
        mobile: mobile,
      })

      debugBrave(`Fetching HTML from: ${url.toString()}`)
      debugBrave(`Request Headers for fetch: %O`, Object.fromEntries(requestHeaders.entries()))

      const html = await fetchHTML({
        url: url.toString(),
        options: {
          headers: requestHeaders,
        },
      })

      // Write HTML to file asynchronously
      if (process.env.DEBUG) {
        try {
          await fs.writeFile('./data/data.html', html)
          debugBrave('HTML content successfully written to ./data/data.html')
        } catch (fsErr: any) {
          debugBrave(`Failed to write HTML to file: ${fsErr.message}`)
        }
      }

      debugBrave(`Loading HTML into Cheerio. HTML length: ${html.length}`)
      const $: cheerio.CheerioAPI = cheerio.load(html)

      // More robust JS data extraction
      let js_data_text: string = $('script').html() ?? ''

      if (!js_data_text) {
        debugBrave('Could not find the script tag containing the main JavaScript data.')
        throw new SearchError('Failed to extract main JavaScript data from HTML.')
      }

      debugBrave('Extracting JS data...')
      const jsData: RootObject = await extractJsData(js_data_text)
      debugBrave('JS data extracted successfully.')

      return [$, jsData]
    } catch (error: any) {
      debugBrave(`BraveEngine search failed for query "${query}": ${error.message}`, error) // Use debugError
      if (error instanceof SearchError) {
        throw error
      }
      throw new SearchError(`BraveEngine search failed for query "${query}": ${error.message}`, { query, error })
    }
  }
}

export default BraveEngine
