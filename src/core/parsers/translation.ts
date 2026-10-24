import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'

export interface TranslationData {
  source_language: string | null
  target_language: string | null
  source_text: string | null
  target_text: string | null
}

export function parse(_$: CheerioAPI, jsData: RootObject): TranslationData | null {
  const translationData = jsData.data.body.response.rich?.results.find((item) => item.subtype === 'translator')
  if (!translationData?.translator) return null

  const t = translationData.translator
  return {
    source_language: t.from_language.name,
    source_text: t.phrase,
    target_language: t.to_language.name,
    target_text: null, // TODO: response field not yet mapped
  }
}

export default { parse }
