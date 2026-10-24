import debug from 'debug'
import { parse } from 'lossless-json'
import { parseAndWalk } from 'oxc-walker'
import { jsonrepair } from 'jsonrepair'
import type { Node } from 'oxc-parser'
import { Discussions, GenericInfobox, InfoboxPlace, InfoboxWithLocation, News, QAInfobox, Query, Rich, Search, Videos } from './types'

const debugBrave = debug('brave:data')

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

/* ------------------------------------------------------------------ */
/* AST helpers                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recursively unwrap `ParenthesizedExpression` nodes.
 *
 * oxc-parser preserves parentheses as AST nodes, so `(function(){...})()`
 * arrives as `CallExpression` whose `callee` is a `ParenthesizedExpression`
 * wrapping the `FunctionExpression`. Same for array elements:
 * `[(function(){...})(...)]` produces elements of type
 * `ParenthesizedExpression` instead of `CallExpression`.
 */
function unwrap(node: any): any {
  let n = node
  while (n?.type === 'ParenthesizedExpression') n = n.expression
  return n
}

/**
 * Serialize an ESTree literal node into a JSON string.
 * Only literal-encodable nodes are emitted; anything else becomes `null`.
 */
function nodeToJson(node: any): string {
  if (!node || typeof node !== 'object') return 'null'

  switch (node.type) {
    case 'Literal': {
      if (node.value === undefined) return 'null'
      return JSON.stringify(node.value)
    }
    case 'Identifier': {
      // `undefined`, `NaN`, `Infinity`, bare identifiers → null
      return 'null'
    }
    case 'UnaryExpression': {
      const argRaw = nodeToJson(node.argument)
      let argVal: unknown
      try {
        argVal = JSON.parse(argRaw)
      } catch {
        return 'null'
      }
      switch (node.operator) {
        case '-':
          return JSON.stringify(-Number(argVal))
        case '+':
          return JSON.stringify(+Number(argVal))
        case '!':
          return JSON.stringify(!argVal)
        case 'void':
          return 'null'
        default:
          return 'null'
      }
    }
    case 'ObjectExpression': {
      const parts: string[] = []
      for (const prop of node.properties ?? []) {
        if (!prop || prop.type !== 'Property') continue
        if (prop.kind !== 'init') continue
        const key = prop.key
        let keyStr: string
        if (key?.type === 'Identifier') keyStr = key.name
        else if (key?.type === 'Literal') keyStr = String(key.value)
        else keyStr = 'null'
        parts.push(`${JSON.stringify(keyStr)}:${nodeToJson(prop.value)}`)
      }
      return `{${parts.join(',')}}`
    }
    case 'ArrayExpression': {
      const parts = (node.elements ?? []).map((el: any) => (el ? nodeToJson(el) : 'null'))
      return `[${parts.join(',')}]`
    }
    case 'TemplateLiteral': {
      const exprs = node.expressions ?? []
      if (exprs.length === 0) {
        const text = (node.quasis ?? []).map((q: any) => q.value?.cooked ?? '').join('')
        return JSON.stringify(text)
      }
      return 'null'
    }
    case 'ParenthesizedExpression': {
      return nodeToJson(node.expression)
    }
    default:
      return 'null'
  }
}

/**
 * Given an element of the outer `data: [...]` array, walk through any
 * `ParenthesizedExpression` wrappers, and if the element is a function-call
 * returning `{ type: "data", data: { ... } }`, return that object literal.
 */
function findDataObjectLiteral(node: any): any | null {
  const n = unwrap(node)
  if (!n) return null

  if (n.type === 'ObjectExpression') return n

  if (n.type === 'CallExpression') {
    const fn = unwrap(n.callee)
    if (fn?.type === 'FunctionExpression' || fn?.type === 'ArrowFunctionExpression') {
      const body = fn.body
      const stmts = body?.type === 'BlockStatement' ? body.body : []
      for (const stmt of stmts) {
        if (stmt.type !== 'ReturnStatement') continue
        const ret = unwrap(stmt.argument)
        if (ret?.type === 'ObjectExpression') {
          const isData = (ret.properties ?? []).some(
            (p: any) => p?.type === 'Property' && p.key?.type === 'Identifier' && p.key.name === 'type' && p.value?.type === 'Literal' && p.value.value === 'data',
          )
          if (isData) return ret
        }
      }
    }
  }

  return null
}

/* ------------------------------------------------------------------ */
/* Textual fallback normalization                                      */
/* ------------------------------------------------------------------ */

function normalizeJsNumbers(raw: string): string {
  return raw
    .replaceAll('void 0', 'null')
    .replaceAll(/(?<!\d)(-?)\.(\d+)(?![.\deE])/g, '$10.$2')
    .replace(/(?<![\w."'])(-?\d+(?:\.\d+)?)[eE]([+-]?\d+)(?![\w."'])/g, (_m, m: string, e: string) => {
      const v = Number(`${m}e${e}`)
      return Number.isFinite(v) ? v.toString() : _m
    })
}

/* ------------------------------------------------------------------ */
/* Public extraction                                                   */
/* ------------------------------------------------------------------ */

export function extractJsData(body: string): Promise<RootObject> {
  return new Promise((resolve, reject) => {
    try {
      let settled = false
      const finish = (fn: () => void) => {
        if (!settled) {
          settled = true
          fn()
        }
      }

      parseAndWalk(body, 'noop.js', (node: Node) => {
        if (settled) return
        const n: any = node

        if (n.type === 'Property' && n.key?.type === 'Identifier' && n.key.name === 'data' && n.value?.type === 'ArrayExpression') {
          const arr = n.value
          const rawData = body.slice(arr.start, arr.end)

          // Path A — evaluate as JS. This is Brave's own payload, which the
          // browser would execute verbatim; the array is a self-contained
          // literal + IIFEs (all arguments passed positionally, no closures
          // over external variables).
          try {
            if (rawData.length < 5_000_000) {
              // eslint-disable-next-line no-new-func
              const evaluated = new Function(`return ${rawData}`)()
              if (Array.isArray(evaluated) && evaluated.length >= 1) {
                // index 0 = { type:"data", data:{ userAgent, i18n, ... } }
                // index 1 = { type:"data", data:{ body:{ response:{...} } } }
                const responseData = evaluated[1] ?? evaluated[0]
                debugBrave('extracted via Function evaluation')
                finish(() => resolve(responseData as RootObject))
                return
              }
            } else {
              debugBrave('payload too large for Function evaluation (%d bytes)', rawData.length)
            }
          } catch (e) {
            debugBrave('Function evaluation failed: %O', e)
          }

          // Path B — AST walk (unwraps ParenthesizedExpression via findDataObjectLiteral).
          for (const el of arr.elements ?? []) {
            const objLit = findDataObjectLiteral(el)
            if (!objLit) continue
            const json = nodeToJson(objLit)
            try {
              const parsed = JSON.parse(json)
              debugBrave('extracted via AST object literal')
              finish(() => resolve(parsed as RootObject))
              return
            } catch (e) {
              debugBrave('AST → JSON.parse failed: %O', e)
            }
          }

          // Path C — normalize + jsonrepair + lossless-json.
          debugBrave('AST path produced no object literal, falling back to jsonrepair')
          const normalized = normalizeJsNumbers(rawData)
          const repaired = jsonrepair(normalized)
          try {
            const parsed = parse(repaired)
            if (Array.isArray(parsed) && parsed.length >= 1) {
              const [, responseData] = parsed
              debugBrave('extracted via jsonrepair fallback')
              finish(() => resolve(responseData as RootObject))
            } else {
              debugBrave('jsonrepair result is not an array: %O', parsed)
            }
          } catch (e) {
            debugBrave('jsonrepair fallback failed: %O', e)
          }
        }
      })

      if (!settled) {
        setTimeout(() => finish(() => reject(new Error('No array data found for "data" property.'))), 100)
      }
    } catch (error) {
      debugBrave('walk failed: %O', error)
      reject(new Error(`Failed to parse JavaScript body: ${error instanceof Error ? error.message : String(error)}`))
    }
  })
}
