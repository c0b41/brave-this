import BraveEngine, { SearchParams } from '#engine/brave'
import * as cheerio from 'cheerio'
import constants from '#utils/constants'
import { SearchError } from '#utils'
import { extractJsData } from '#utils/brave'

import OrganicResults from '#nodes/organicresults'
import KnowledgeGraph from '#nodes/knowledgegraph'
import News from '#nodes/news'
import Videos from '#nodes/videos'
import Translation from '#nodes/translation'
import Converters from '#nodes/converters'
import Weather from '#nodes/weather'
import Time from '#nodes/time'
//import Location from '#nodes/location'
//import Dictionary from '#nodes/dictionary'

const braveEngine = new BraveEngine()

type SearchResult = {
  did_you_mean: string | null
  results: OrganicResults | null
  knowledges: KnowledgeGraph | null
  news: News | null
  videos: Videos | null
  weather: Weather | null
  time: Time | null
  location: null
  dictionary: null
  translation: Translation | null

  units: Converters | null
  people_also_ask: string[]
  people_also_search: {
    title: string
    thumbnail: string
  }[]
}

async function search({ query, options = {} }: SearchParams): Promise<SearchResult> {
  //const ris = options.ris || false
  //const safe = options.safe || false
  //const page = options.page ? options.page * 10 : 0

  if (!query) throw new SearchError('Query is required.', query)

  const response = await braveEngine.search({ query, options })
  const $ = cheerio.load(response.data)

  let js_data_text = $('script').html() ?? ''
  let jsData = await extractJsData(js_data_text)

  return {
    did_you_mean: $(constants.SELECTORS.DID_YOU_MEAN).text().trim() || null,
    results: OrganicResults.parse($, jsData),
    knowledges: new KnowledgeGraph($, jsData),
    videos: Videos.parse($, jsData),
    weather: Weather.parse($, jsData),
    time: Time.parse($, jsData),
    location: null, //Location.parse($),
    dictionary: null, //new Dictionary($),
    translation: Translation.parse($, jsData),
    news: News.parse($, jsData),
    units: Converters.parse($, jsData),
    people_also_ask: [],
    people_also_search: [],
  }
}

export { search }
