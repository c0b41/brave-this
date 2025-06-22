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
  mobile?: boolean
  additionalHeaders?: Record<string, string | number>
}

export function getHeaders(options: HeaderOptions = {}): Record<string, string | number> {
  const uaList = userAgents[options.mobile ? 'mobile' : 'desktop']
  const ua = uaList[Math.floor(Math.random() * uaList.length)]

  return {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate',
    'accept-language': 'en-US,en;q=0.5',
    referer: 'https://search.brave.com/',
    'upgrade-insecure-requests': 1,
    'user-agent': ua,
    ...options.additionalHeaders,
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
    headers?: Record<string, string | number>
  }
}

export async function fetchHTML({ url, options }: FetchHTMLParams): Promise<string> {
  try {
    const { headers } = options
    const { body } = await request(url, {
      method: 'GET',
      //headers: headers ?? {}
    })
    return await body.text()
  } catch (error) {
    throw new SearchError(`Failed to fetch HTML from ${url}: ${error.message}`, { url, error })
  }
}
