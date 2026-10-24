import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'

export interface RelatedQueriesData {
  querys: string[]
}

export function parse(_$: CheerioAPI, jsData: RootObject): RelatedQueriesData | null {
  // At runtime: `query.related_queries` is a `SingleRelatedQuery[]`
  // (array of arrays of [boolean, string] tuples), NOT an object with a
  // nested `.related_queries` — the type in `types.ts` was modelled after
  // the Brave API schema, not the SERP payload.
  const raw = jsData.data.body.response.query?.related_queries as Array<Array<[boolean, string]>> | undefined

  if (!raw || raw.length === 0) return null

  const querys = raw.map((parts) => parts.map(([, key]) => key).join(' '))
  return { querys }
}

export default { parse }
