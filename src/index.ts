import BraveEngine, { SearchParams } from './core/engines/brave'
import * as cheerio from 'cheerio'
import constants from './utils/constants'
import { refineData, SearchError, extractJsData } from './utils'

//import FeaturedSnippet from './core/nodes/featuredsnippet'
//import Translation from './core/nodes/translation'
//import Dictionary from './core/nodes/dictionary'
import Converters from './core/nodes/converters'
import TopStories from './core/nodes/topstories'
import Videos, { Video } from './core/nodes/videos'
import OrganicResults from './core/nodes/organicresults'
import Weather from './core/nodes/weather'
import Time from './core/nodes/time'
//import Location from './core/nodes/location'
import KnowledgeGraph from './core/nodes/knowledgegraph'

const braveEngine = new BraveEngine()

type SearchResult = {
  results: {
    title: string
    description: string
    url: string
    is_sponsored: boolean
    favicons: {
      high_res: string
      low_res: string
    }
  }[]
  videos: Video[]
  knowledge_panel: KnowledgeGraph | null
  featured_snippet: null
  did_you_mean: string | null
  weather: Weather | null
  time: Time
  location: null
  dictionary: null
  translation: null
  top_stories:
    | {
        description: string
        url: string
      }[]
    | null
  unit_converter: Converters | null
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
  const use_mobile_ua = Reflect.has(options, 'use_mobile_ua') ? options.use_mobile_ua : true
  const parse_ads = options.parse_ads || false
  const additional_params = options.additional_params || {}

  if (!query) throw new SearchError('Query is required.', query)

  const response = await braveEngine.search({ query, options })
  const $ = cheerio.load(refineData(response.data, parse_ads, use_mobile_ua))

  let js_data_text = $('script').html() ?? ''
  let js_data = await extractJsData(js_data_text)

  return {
    results: OrganicResults.parse($, parse_ads, use_mobile_ua),
    videos: Videos.parse($, js_data),

    knowledge_panel: new KnowledgeGraph($, js_data),
    featured_snippet: null, // new FeaturedSnippet($),

    did_you_mean: $(constants.SELECTORS.DID_YOU_MEAN).text().trim() || null,

    weather: null, // new Weather($, response.data),
    time: Time.parse($),
    location: null, //Location.parse($),

    dictionary: null, //new Dictionary($),
    translation: null, //new Translation($),
    top_stories: TopStories.parse($, js_data),
    unit_converter: new Converters($, js_data),

    people_also_ask: [],
    people_also_search: [],
  }
}

export { search }
