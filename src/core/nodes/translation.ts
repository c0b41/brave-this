import { RootObject } from '#utils/brave'

// Define interface for translation result (optional)
export interface TranslationData {
  source_language: string | null
  target_language: string | null
  source_text: string | null
  target_text: string | null
}

// Main class
export default class Translation {
  /**
   * Parses top stories from HTML
   */
  static parse($: any, jsData: RootObject): TranslationData | null {
    let translationData = jsData.data.body.response.rich?.results.find((item) => item.subtype == 'translator')

    if (translationData && translationData.translator) {
      return {
        source_language: translationData.translator.from_language.name,
        source_text: translationData.translator.phrase,
        target_language: translationData.translator.to_language.name,
        target_text: null, // TODO: where is response
      }
    }

    return null
  }
}
