import { RootObject } from '#utils/brave'
import { CheerioAPI } from 'cheerio'

export interface RelatedQuerysMeanData {
  querys: string[]
}

export default class RelatedQuerys {
  static parse($: CheerioAPI, jsData: RootObject): RelatedQuerysMeanData | [] {
    let queries = jsData.data.body.response.query

    if (queries && Array.isArray(queries.related_queries) && queries.related_queries.length > 1) {
      let querys = queries?.related_queries.map((query) => {
        return query
          .map(([_status, key]: [boolean, string]) => {
            return key
          })
          .join(' ')
      })

      return {
        querys: querys,
      }
    }

    return []
  }
}
