import { RootObject } from '#utils/brave'
import { CheerioAPI } from 'cheerio'

export interface DidYouMeanData {
  query: string | null
}

export default class DidYouMean {
  static parse($: CheerioAPI, jsData: RootObject): DidYouMeanData | null {
    let query = jsData.data.body.response.query?.altered || null

    return {
      query: query,
    }
  }
}
