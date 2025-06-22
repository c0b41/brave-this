import { fetchHTML, getHeaders } from '#utils'
import constants from '#utils/constants'

export type SearchParams = {
  query: string
  options?: {
    mobile?: boolean
    ris?: boolean
    safe?: boolean
    page?: number
    parse_ads?: boolean
    use_mobile_ua?: boolean
    additional_params?: object
  }
}

class BraveEngine {
  constructor() {}

  async search({ query, options = {} }: SearchParams) {
    const { mobile = false, page = 0, additional_params = {} } = options

    // Build query parameters
    const params = new URLSearchParams({
      q: query,
      source: 'web',
      ...additional_params,
    })

    if (page > 0) {
      params.set('s', String(page * 10)) // pagination via offset
    }

    const url = `${constants.URLS.BRAVE}?${params.toString()}`

    try {
      // Fetch raw HTML
      const html = await fetchHTML({
        url,
        options: {},
        //options: {
        //  headers: getHeaders({ mobile }),
        //},
      })

      return {
        data: html,
      }
    } catch (error: any) {
      throw new Error(`BraveEngine search failed: ${error.message}`)
    }
  }
}

export default BraveEngine
