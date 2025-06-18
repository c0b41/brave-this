import constants from '../../utils/constants'

export default class Dictionary {
  word: string | null
  phonetic: string | null
  audio: string | null
  definitions: string[]
  examples: string[]

  constructor(private $: any) {
    const rawWord = $(constants.SELECTORS.GD_WORD).text().trim()
    const rawPhonetic = $(constants.SELECTORS.GD_PHONETIC).text().trim()
    const rawAudio = $(constants.SELECTORS.GD_AUDIO).attr('src')

    this.word = rawWord || null
    this.phonetic = rawWord ? rawPhonetic || 'N/A' : null
    this.audio = rawWord && rawAudio ? `https:${rawAudio}` : null

    this.definitions = rawWord
      ? $(constants.SELECTORS.GD_DEFINITIONS)
          .map((i, el) => $(el).text().trim())
          .get()
      : []

    this.examples = rawWord
      ? $(constants.SELECTORS.GD_EXAMPLES)
          .map((i, el) => $(el).text().trim())
          .get()
      : []
  }
}
