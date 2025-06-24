import { RootObject } from '#utils/brave'
import { PartOfSpeechDefinition } from '#utils/brave/types'
import constants from '#utils/constants'

export interface DictionaryData {
  word: string | null
  pronunciation: string | null
  audio: string | null
  definitions: PartOfSpeechDefinition[]
}

export default class Dictionary {
  /**
   * Parses top stories from HTML
   */
  static parse($: any, jsData: RootObject): DictionaryData | null {
    let definitionData = jsData.data.body.response.rich?.results.find((item) => item.subtype == 'definitions')

    if (definitionData && definitionData.definitions) {
      let audioUrl = new URL(constants.URLS.BRAVE_DEFINITIONS)

      const params = new URLSearchParams({
        word: definitionData.definitions.word,
        lang: definitionData.definitions.language,
        source: definitionData.definitions.source_dict,
      })

      audioUrl.search = params.toString()

      return {
        word: definitionData.definitions.word,
        pronunciation: definitionData.definitions.pronounciation,
        audio: audioUrl.toString(),
        definitions: definitionData.definitions.definitions,
      }
    }

    return null
  }
}
