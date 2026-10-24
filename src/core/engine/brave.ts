import debug from 'debug'
import * as cheerio from 'cheerio'
import { Headers } from 'undici'

import { fetchHTML, getHeaders } from '#utils/http'
import { SearchError } from '#utils/errors'
import { extractJsData, RootObject } from '#utils/brave'
import constants from '#utils/constants'
import { resolveDebugContext, saveHtml, saveJsPayload, saveJsonPayload, saveMeta, DebugContext } from '#debug/artifacts'

const debugBrave = debug('brave:engine')

export type SearchParams = {
  query: string
  options?: {
    safe?: 'off' | 'moderate' | 'strict'
    lang?: string
    page?: number
    mobile?: boolean
    /** Explicit UA. Overrides the built-in pool. */
    userAgent?: string
    headers?: Headers
    debugDir?: string
  }
}

export interface RawSearchResult {
  $: cheerio.CheerioAPI
  jsData: RootObject
  debugCtx: DebugContext
}

export class BraveEngine {
  async search({ query, options = {} }: SearchParams): Promise<RawSearchResult> {
    debugBrave('search query=%s options=%O', query, options)
    const { safe, lang, headers, mobile, userAgent, page = 0, debugDir } = options

    const url = new URL(constants.URLS.BRAVE)
    url.searchParams.set('q', query)
    if (safe) url.searchParams.set('safe', safe)
    if (lang) url.searchParams.set('search_lang', lang)
    if (page > 0) url.searchParams.set('offset', String(page * 10))

    const debugCtx = resolveDebugContext(query, { mobile, lang, page })
    if (debugDir) debugCtx.dir = debugDir

    try {
      const requestHeaders = getHeaders({
        headers: headers ?? undefined,
        mobile,
        userAgent,
      })
      debugBrave('GET %s', url.toString())

      const html = await fetchHTML({ url: url.toString(), options: { headers: requestHeaders } })

      await saveHtml(debugCtx, html)
      await saveMeta(debugCtx, { url: url.toString(), mobile, lang, page, safe })

      const $ = cheerio.load(html)

      const js_data_text: string =
        $('script')
          .toArray()
          .map((el) => $(el).html() || '')
          .find((text) => text.includes('__sveltekit')) ?? ''

      if (!js_data_text) {
        throw new SearchError('Failed to extract main JavaScript data from HTML.', { query })
      }

      await saveJsPayload(debugCtx, js_data_text)

      debugBrave('extracting JS data...')
      const jsData = await extractJsData(js_data_text)
      await saveJsonPayload(debugCtx, jsData)

      debugBrave('search ok query=%s', query)
      return { $, jsData, debugCtx }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      debugBrave('search failed query=%s err=%s', query, message)
      if (err instanceof SearchError) throw err
      throw new SearchError(`Search failed for query "${query}": ${message}`, { query, error: message })
    }
  }
}

export default BraveEngine
