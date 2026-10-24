import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'
import type { PartOfSpeechDefinition } from '#utils/brave/types'
import constants from '#utils/constants'

export interface DictionaryData {
  word: string | null
  pronunciation: string | null
  audio: string | null
  definitions: PartOfSpeechDefinition[]
}

export function parse(_$: CheerioAPI, jsData: RootObject): DictionaryData | null {
  const definitionData = jsData.data.body.response.rich?.results.find((item) => item.subtype === 'definitions')
  if (!definitionData?.definitions) return null

  const d = definitionData.definitions
  const audioUrl = new URL(constants.URLS.BRAVE_DEFINITIONS)
  const params = new URLSearchParams({
    word: d.word,
    lang: d.language,
    source: d.source_dict,
  })
  audioUrl.search = params.toString()

  return {
    word: d.word,
    pronunciation: d.pronounciation,
    audio: audioUrl.toString(),
    definitions: d.definitions,
  }
}

export default { parse }
