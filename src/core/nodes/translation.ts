import constants from '../../utils/constants'

// Define interface for translation result (optional)
interface TranslationData {
  source_language: string | null
  target_language: string | null
  source_text: string | null
  target_text: string | null
}

// Main class
export default class Translation implements TranslationData {
  source_language: string | null
  target_language: string | null
  source_text: string | null
  target_text: string | null

  constructor(private $: any) {
    const sourceLang = $(constants.SELECTORS.TR_SOURCE_LANGUAGE).text().trim()
    const targetLang = $(constants.SELECTORS.TR_TARGET_LANGUAGE).text().trim()

    const sourceText = $(constants.SELECTORS.TR_SOURCE_TEXT).text().trim()
    const targetText = $(constants.SELECTORS.TR_TARGET_TEXT).text().trim()

    this.source_language = sourceText ? sourceLang : null
    this.target_language = sourceText ? targetLang : null
    this.source_text = sourceText || null
    this.target_text = targetText || null
  }
}
