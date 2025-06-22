import { RootObject } from '#utils/brave'
import { CheerioAPI } from 'cheerio'

export interface WeatherData {
  location: string | null
  forecast: string | null
  precipitation: string | null
  humidity: string | null
  temperature: string | null
  wind: string | null
  image: string | null
}

export default class Weather {
  static parse($: CheerioAPI, jsData: RootObject): WeatherData | null {
    let timeData = jsData.data.body.response.rich?.results.find((item) => item.subtype == 'timezones')

    // TODO: json parse broken
    return null
  }
}
