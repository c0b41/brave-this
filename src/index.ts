import BraveEngine, { SearchParams } from '#engine/brave'
import * as cheerio from 'cheerio'
import { SearchError } from '#utils'
import { extractJsData } from '#utils/brave'
import { SearchResult } from '#engine/brave'

import OrganicResults from '#nodes/organicresults'
import KnowledgeGraph from '#nodes/knowledgegraph'
import News from '#nodes/news'
import Videos from '#nodes/videos'
import Translation from '#nodes/translation'
import Converters from '#nodes/converters'
import Weather from '#nodes/weather'
import Time from '#nodes/time'
import Location from '#nodes/location'
import Dictionary from '#nodes/dictionary'
import DidYouMean from '#nodes/didyoumean'
import RelatedQuerys from '#nodes/relatedquery'
import Discussions from '#nodes/discussions'

async function search({ query, options = {} }: SearchParams): Promise<SearchResult> {
  if (!query) throw new SearchError('Query is required.', query)

  const braveEngine = new BraveEngine()

  const response = await braveEngine.search({ query, options })

  const $: cheerio.CheerioAPI = cheerio.load(response.data)

  let js_data_text = $('script').html() ?? ''
  let jsData = await extractJsData(js_data_text)

  return {
    results: OrganicResults.parse($, jsData),
    knowledges: new KnowledgeGraph($, jsData),
    videos: Videos.parse($, jsData),
    weather: Weather.parse($, jsData),
    time: Time.parse($, jsData),
    location: Location.parse($, jsData),
    dictionary: Dictionary.parse($, jsData),
    translation: Translation.parse($, jsData),
    news: News.parse($, jsData),
    units: Converters.parse($, jsData),
    didYouMean: DidYouMean.parse($, jsData),
    relatedQuerys: RelatedQuerys.parse($, jsData),
    discussions: Discussions.parse($, jsData),
  }
}

export { search }
