import BraveEngine, { SearchParams } from '#engine/brave'
import { SearchError } from '#utils'
import { BraveSearchResult } from '#engine/brave'

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

async function search({ query, options = {} }: SearchParams): Promise<BraveSearchResult> {
  if (!query) throw new SearchError('Query is required.', query)

  const [$, jsData] = await new BraveEngine().search({ query, options })

  return {
    results: OrganicResults.parse($, jsData),
    knowledges: KnowledgeGraph.parse($, jsData),
    videos: Videos.parse($, jsData),
    weather: Weather.parse($, jsData),
    time: Time.parse($, jsData),
    location: Location.parse($, jsData),
    dictionary: Dictionary.parse($, jsData),
    translation: Translation.parse($, jsData),
    news: News.parse($, jsData),
    converters: Converters.parse($, jsData),
    didYouMean: DidYouMean.parse($, jsData),
    relatedqueries: RelatedQuerys.parse($, jsData),
    discussions: Discussions.parse($, jsData),
  }
}

export { search }
