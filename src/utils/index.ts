import userAgents from './user-agents.json'
import { request } from 'undici'
import { parseAndWalk } from 'oxc-walker'
import { jsonrepair } from 'jsonrepair'
import { Node } from 'oxc-parser'

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

export function refineData(data: string, parse_ads = false, is_mobile = true): string {
  if (!data) return ''

  let html = data

  // Remove unwanted classes
  html = html.replace(/N6jJud VwiC3b lyLwlc/g, '')
  html = html.replace(/YjtGef ExmHv VwiC3b/g, '')
  html = html.replace(/VwiC3b lyLwlc aLF0Z/g, '')

  // Normalize description class names
  html = html.replace(/yDYNvb lEBKkf/g, 'yDYNvb')
  html = html.replace(/VwiC3b yDYNvb/g, 'MUxGbd yDYNvb')
  html = html.replace(/VwiC3b MUxGbd yDYNvb/g, 'MUxGbd yDYNvb')

  // Normalize URL class names
  html = html.replace(/cz3goc BmP5tf/g, 'C8nzq BmP5tf')
  html = html.replace(/cz3goc v5yQqb BmP5tf/g, 'C8nzq BmP5tf')

  // Normalize title class names
  html = html.replace(/ynAwRc q8U8x MBeuO oewGkc LeUQr/g, 'ynAwRc q8U8x MBeuO gsrt oewGkc LeUQr')
  html = html.replace(/MBeuO oewGkc/g, 'MBeuO gsrt oewGkc')

  // Transform desktop-specific titles
  if (!is_mobile) {
    html = html.replace(/yuRUbf|v5yQqb/g, 'ynAwRc q8U8x MBeuO gsrt oewGkc LeUQr')
  }

  // Parse ads if enabled
  if (parse_ads) {
    html = html.replace(/cz3goc v5yQqb BmP5tf/g, 'C8nzq BmP5tf')
  }

  return html
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

export function extractJsData(body: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      let dataFound = false

      parseAndWalk(body, 'noop.js', (node: Node) => {
        if (dataFound) {
          return
        }

        if (node.type === 'Property' && 'name' in node.key && node.key.name === 'data' && node.value.type === 'ArrayExpression') {
          const start = node.start + `data: `.length
          const end = node.end
          let rawData = body.slice(start, end)

          rawData = rawData.replaceAll('void 0', 'null')

          try {
            const parsedData = JSON.parse(jsonrepair(rawData))
            if (Array.isArray(parsedData)) {
              dataFound = true
              resolve(parsedData)
            } else {
              console.warn('Extracted "data" property is not an array:', parsedData)
            }
          } catch (jsonError) {
            console.error('Error parsing or repairing JSON data:', jsonError)
          }
        }
      })

      if (!dataFound) {
        reject(new Error('No array data found for "data" property.'))
      }
    } catch (error) {
      console.error('Error during JavaScript parsing:', error)
      reject(new Error(`Failed to parse JavaScript body: ${error instanceof Error ? error.message : String(error)}`))
    }
  })
}
