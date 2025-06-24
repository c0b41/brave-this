import { UndiciHeaders } from 'undici/types/dispatcher'
import userAgents from './user-agents.json'
import { request } from 'undici'

export class SearchError extends Error {
  info?: any
  date: Date
  version: string

  constructor(message: string, info?: any) {
    super(message)
    this.name = 'SearchError'
    this.date = new Date()
    this.version = require('../../package.json').version
    if (info) this.info = info
  }
}

export interface HeaderOptions {
  headers?: UndiciHeaders
  mobile?: boolean
}

export function getHeaders(options: HeaderOptions = {}): UndiciHeaders {
  const available_agents = userAgents[options.mobile ? 'mobile' : 'desktop']
  const ua = available_agents[0]

  return {
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
    //referer: 'https://search.brave.com/',
    ...options.headers,
  }
}

export function getStringBetweenStrings(data: string, startString: string, endString: string): string | undefined {
  const regex = new RegExp(`${escapeStringRegexp(startString)}(.*?)${escapeStringRegexp(endString)}`, 's')
  const match = data.match(regex)
  return match ? match[1] : undefined
}

export function escapeStringRegexp(string: string): string {
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
  options: {
    headers?: UndiciHeaders
  }
}

export async function fetchHTML({ url, options }: FetchHTMLParams): Promise<string> {
  try {
    const { headers } = options

    console.log(`Request Header ${JSON.stringify(headers, null, 2)}`)
    const { body } = await request(url, {
      method: 'GET',
      headers: headers ?? {},
    })
    return await body.text()
  } catch (error) {
    throw new SearchError(`Failed to fetch HTML from ${url}: ${error.message}`, { url, error })
  }
}
