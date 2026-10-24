import debug from 'debug'
import userAgents from './user-agents.json'
import { fetch, setGlobalDispatcher, buildConnector, Agent, Headers } from 'undici'
import tls from 'https-tls'
import { SearchError } from './errors'

const debugHttp = debug('brave:http')

export interface RequestOptions {
  /**
   * Explicit user agent. When set, takes precedence over `mobile` and the
   * built-in pool. Useful when the caller wants a specific UA (e.g. a known
   * Chrome version) and doesn't want random rotation.
   */
  userAgent?: string
  /** Pre-built Headers object. Merged on top of the defaults. */
  headers?: Headers | Record<string, string>
  /** Pick from the mobile pool instead of the desktop pool. Ignored when userAgent is set. */
  mobile?: boolean
}

const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'

function pickUa(options: RequestOptions): string {
  if (options.userAgent) return options.userAgent

  const pool = (userAgents as Record<string, string[]>)[options.mobile ? 'mobile' : 'desktop']
  if (!pool || pool.length === 0) {
    debugHttp('no user agents found, using default')
    return DEFAULT_UA
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getHeaders(options: RequestOptions = {}): Headers {
  const ua = pickUa(options)

  const base: Record<string, string> = {
    'accept-encoding': 'gzip, deflate',
    'accept-language': 'en-US,en;q=0.5',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    priority: 'u=0, i',
    'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': options.mobile ? '?1' : '?0',
    'sec-ch-ua-platform': options.mobile ? '"Android"' : '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'sec-gpc': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': ua,
    cookie: 'useLocation=0; summarizer=0',
    referer: 'https://search.brave.com/',
  }

  // Merge caller overrides. Handles both plain records and Headers instances.
  if (options.headers instanceof Headers) {
    for (const [k, v] of options.headers.entries()) base[k] = v
  } else if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) base[k] = String(v)
  }

  return new Headers(base)
}

export interface FetchHTMLParams {
  url: string
  options?: {
    headers?: Headers
  }
}

export async function fetchHTML({ url, options = {} }: FetchHTMLParams): Promise<string> {
  try {
    const { headers } = options

    const ua = headers?.get('user-agent')
    if (ua) {
      const tlsOptions = (tls as unknown as (ua: string) => Record<string, unknown>)(ua)
      const connector = buildConnector(tlsOptions)
      setGlobalDispatcher(new Agent({ connect: connector }))
      debugHttp('tls dispatcher active ua=%s', ua)
    } else {
      debugHttp('no user-agent supplied, using default dispatcher')
    }

    debugHttp('GET %s', url)
    if (headers) {
      debugHttp('headers %O', Object.fromEntries(headers.entries()))
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers ?? {},
    })

    if (!response.ok) {
      debugHttp('request failed %d %s for %s', response.status, response.statusText, url)
      throw new SearchError(`Request failed: ${response.status} ${response.statusText}`, {
        url,
        status: response.status,
        statusText: response.statusText,
      })
    }

    const html = await response.text()
    debugHttp('ok %s bytes=%d', url, html.length)
    return html
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    debugHttp('fetch error %s: %s', url, message)
    if (error instanceof SearchError) throw error
    throw new SearchError(`Failed to fetch ${url}: ${message}`, { url, error: message })
  }
}
