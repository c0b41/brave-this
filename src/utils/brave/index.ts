import debug from 'debug'
import { parse } from 'lossless-json'
import { parseAndWalk } from 'oxc-walker'
import { jsonrepair } from 'jsonrepair'
import type { Node } from 'oxc-parser'
import fs from 'fs'
import path from 'path'
import { Discussions, GenericInfobox, InfoboxPlace, InfoboxWithLocation, News, QAInfobox, Query, Rich, Search, Videos } from './types'
const debugBrave = debug('brave')

// https://github.com/erik-balfe/brave-search/blob/master/src/types.ts#L704

export interface GraphInfobox {
  type: 'graph'
  results: Array<GenericInfobox | QAInfobox | InfoboxPlace | InfoboxWithLocation>
}

export interface WebSearchApiResponse {
  type: 'search'
  query?: Query
  web?: Search
  videos?: Videos
  news?: News
  rich?: Rich
  infobox?: GraphInfobox
  discussions: Discussions
}

interface Body {
  key: number
  mixerTime: number
  shouldFallback: boolean
  clusterResultsMin: number
  response: WebSearchApiResponse
}

interface Data {
  body: Body
}

export interface RootObject {
  type: string
  data: Data
}

export function extractJsData(body: string): Promise<RootObject> {
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

          if (process.env.BRAVE_OUTPUT) {
            fs.writeFileSync(path.join(process.cwd(), './data/data.js'), rawData)
          }

          rawData = rawData
            .replaceAll('void 0', 'null') // void
            .replaceAll(/(?<!\d)(-?)\.(\d+)\b/g, '$10.$2') // decimal .96

          try {
            const parsedData = parse(jsonrepair(rawData))

            if (process.env.BRAVE_OUTPUT) {
              fs.writeFileSync(path.join(process.cwd(), './data/data.json'), JSON.stringify(parsedData, null, 2))
            }

            if (Array.isArray(parsedData) && parsedData.length >= 1) {
              dataFound = true
              let [, responseData] = parsedData
              resolve(responseData)
            } else {
              debugBrave('Extracted "data" property is not an array:', parsedData)
            }
          } catch (jsonError) {
            debugBrave('Error parsing or repairing JSON data:', jsonError)
          }
        }
      })

      if (!dataFound) {
        reject(new Error('No array data found for "data" property.'))
      }
    } catch (error) {
      debugBrave('Error during JavaScript parsing:', error)
      reject(new Error(`Failed to parse JavaScript body: ${error instanceof Error ? error.message : String(error)}`))
    }
  })
}
