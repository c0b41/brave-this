import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'

export interface LocationData {
  title: string | null
  distance: string | null
  map: string | null
}

export function parse(_$: CheerioAPI, _jsData: RootObject): LocationData | null {
  // Not currently supported by the JSON payload.
  return null
}

export default { parse }
