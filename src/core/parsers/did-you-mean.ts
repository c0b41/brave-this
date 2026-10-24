import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'

export interface DidYouMeanData {
  query: string | null
}

export function parse(_$: CheerioAPI, jsData: RootObject): DidYouMeanData | null {
  const altered = jsData.data.body.response.query?.altered
  if (!altered) return null
  return { query: altered }
}

export default { parse }
