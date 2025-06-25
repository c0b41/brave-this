import debug from 'debug'
import userAgents from './user-agents.json'
import { fetch, setGlobalDispatcher, buildConnector, Agent, HeadersInit, Headers } from 'undici'
import tls from 'https-tls'
import { version } from '../../package.json'
const debugBrave = debug('brave')

export class SearchError extends Error {
  info?: any
  date: Date
  version: string

  constructor(message: string, info?: any) {
    super(message)
    this.name = 'SearchError'
    this.date = new Date()
    this.version = version // Use the imported version
    if (info) this.info = info
  }
}

export interface RequestOptions {
  headers?: HeadersInit
  mobile?: boolean
}

export function getHeaders(options: RequestOptions = {}): Headers {
  // Defensive check for userAgents structure
  const available_agents = userAgents[options.mobile ? 'mobile' : 'desktop']
  if (!available_agents || available_agents.length === 0) {
    debugBrave('No user agents found for the specified type (mobile/desktop). Using a default.')
    // Fallback to a generic user agent or throw an error if no agents are critical
    return new Headers({ 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' })
  }

  const ua = available_agents[0]

  return new Headers({
    'accept-encoding': 'gzip, deflate',
    'accept-language': 'en-US,en;q=0.5',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    priority: 'u=0, i',
    'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'sec-gpc': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': ua,
    cookie: 'useLocation=0; summarizer=0',
    ...options.headers,
    // referer: 'https://search.brave.com/', // Keep commented if not actively used
  })
}

export function getStringBetweenStrings(data: string, startString: string, endString: string): string | undefined {
  const regex = new RegExp(`${escapeStringRegexp(startString)}(.*?)${escapeStringRegexp(endString)}`, 's')
  const match = data.match(regex)
  return match ? match[1] : undefined
}

export function escapeStringRegexp(string: string): string {
  // The original regex for escaping is correct.
  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

export function generateRandomString(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }
  return result
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
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

    if (headers && headers.get('user-agent')) {
      const tlsOptions = (tls as any)(headers.get('user-agent')) // Cast tls to any if it's not typed
      const connector = buildConnector(tlsOptions)
      const tlsAgent = new Agent({
        connect: connector,
      })
      setGlobalDispatcher(tlsAgent)
      debugBrave(`Fetch TLS fingerprinting dispatcher active for user-agent: ${headers.get('user-agent')}`)
    } else {
      debugBrave('No specific user-agent provided for TLS fingerprinting, using default dispatcher.')
    }

    debugBrave(`Requesting URL: ${url}`)
    if (headers) {
      debugBrave(`Request Headers: ${JSON.stringify(Object.fromEntries(headers.entries()), null, 2)}`)
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers ?? {},
    })

    if (!response.ok) {
      debugBrave(`Search request failed for ${url} with status: ${response.status} ${response.statusText}`)
      throw new SearchError(`Search request failed: ${response.status} ${response.statusText}`, { url, status: response.status, statusText: response.statusText })
    }

    const blob = await response.text()
    debugBrave(`Successfully fetched HTML from ${url}. Content length: ${blob.length}`)

    return blob
  } catch (error: any) {
    debugBrave(`Failed to fetch HTML from ${url}: ${error.message}`, error) // Log the error details with debugError
    throw new SearchError(`Failed to fetch HTML from ${url}: ${error.message}`, { url, error })
  }
}
