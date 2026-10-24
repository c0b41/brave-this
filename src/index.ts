import BraveEngine from '#engine/brave'
import type { SearchParams } from '#engine/brave'
import { SearchError } from '#utils/errors'
import { saveParsedResult } from '#debug/artifacts'

import * as OrganicResults from '#parsers/organic-results'
import * as KnowledgeGraph from '#parsers/knowledge-graph'
import * as News from '#parsers/news'
import * as Videos from '#parsers/videos'
import * as Weather from '#parsers/weather'
import * as Time from '#parsers/time'
import * as Location from '#parsers/location'
import * as Dictionary from '#parsers/dictionary'
import * as Translation from '#parsers/translation'
import * as Converters from '#parsers/converters'
import * as DidYouMean from '#parsers/did-you-mean'
import * as RelatedQueries from '#parsers/related-queries'
import * as Discussions from '#parsers/discussions'

import type { OrganicResult } from '#parsers/organic-results'
import type { ParsedKnowledgeGraphData } from '#parsers/knowledge-graph'
import type { NewsItem } from '#parsers/news'
import type { Video } from '#parsers/videos'
import type { WeatherData } from '#parsers/weather'
import type { TimeData } from '#parsers/time'
import type { LocationData } from '#parsers/location'
import type { DictionaryData } from '#parsers/dictionary'
import type { TranslationData } from '#parsers/translation'
import type { ConversionData } from '#parsers/converters'
import type { DidYouMeanData } from '#parsers/did-you-mean'
import type { RelatedQueriesData } from '#parsers/related-queries'
import type { Discussion } from '#parsers/discussions'

export type BraveSearchResult = {
  results: OrganicResult[] | null
  knowledges: ParsedKnowledgeGraphData | null
  news: NewsItem[] | null
  videos: Video[] | null
  weather: WeatherData | null
  time: TimeData | null
  location: LocationData | null
  dictionary: DictionaryData | null
  translation: TranslationData | null
  converters: ConversionData | null
  didYouMean: DidYouMeanData | null
  relatedqueries: RelatedQueriesData | null
  discussions: Discussion[] | null
}

export async function search({ query, options = {} }: SearchParams): Promise<BraveSearchResult> {
  if (!query) throw new SearchError('Query is required.', { query })

  const { $, jsData, debugCtx } = await new BraveEngine().search({ query, options })

  const result: BraveSearchResult = {
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
    relatedqueries: RelatedQueries.parse($, jsData),
    discussions: Discussions.parse($, jsData),
  }

  await saveParsedResult(debugCtx, result)
  return result
}

export { SearchError }
export type { SearchParams }
