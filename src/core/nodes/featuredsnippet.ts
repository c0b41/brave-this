import constants from '../../utils/constants'

// Define a clean interface for Featured Snippet data
interface FeaturedSnippetData {
  title: string | null
  description: string | null
  url: string | null
}

export default class FeaturedSnippet implements FeaturedSnippetData {
  title: string | null
  description: string | null
  url: string | null

  constructor(private $: any) {
    this.title = this.parseTitle()
    this.url = this.parseUrl()
    this.description = this.parseDescription()
  }

  /**
   * Parse the title from multiple possible selectors
   */
  private parseTitle(): string | null {
    const { FEATURED_SNIPPET_TITLE } = constants.SELECTORS
    return this.$trimText(FEATURED_SNIPPET_TITLE[0]) || this.$trimText(FEATURED_SNIPPET_TITLE[1]) || this.$trimText(FEATURED_SNIPPET_TITLE[2]) || null
  }

  /**
   * Parse the URL from selector
   */
  private parseUrl(): string | null {
    const hrefs = $(constants.SELECTORS.FEATURED_SNIPPET_URL)
      .map((_i, el) => $(el).attr('href'))
      .get()

    return hrefs[0] || null
  }

  /**
   * Parse the description with special handling for different HTML structures
   */
  private parseDescription(): string | null {
    const { FEATURED_SNIPPET_DESC } = constants.SELECTORS

    for (let i = 0; i < FEATURED_SNIPPET_DESC.length; i++) {
      const selector = FEATURED_SNIPPET_DESC[i]
      const html = $(selector).html()?.trim()

      if (!html) continue

      if (i !== 2) {
        return html
          .replace(/<\/li>|<\/b>|<b>/g, '')
          .replace(/&amp;/g, '&')
          .split('<li class="TrT0Xe">')
          .join('\n')
          .trim()
      } else {
        return $(selector).text().trim()
      }
    }

    return null
  }

  /**
   * Utility to trim text from a selector
   */
  private $trimText(selector: string): string | null {
    const text = $(selector).text().trim()
    return text || null
  }
}
