import { RootObject } from '#utils/brave'
import { CheerioAPI } from 'cheerio'

export interface TimeData {
  hours: string | null
  date: string | null
  city: string | null
  country: string | null
}

// Main class
export default class Time {
  static parse($: CheerioAPI, jsData: RootObject): TimeData | null {
    let timeData = jsData.data.body.response.rich?.results.find((item) => item.subtype == 'timezones')

    if (timeData && timeData.timezones && timeData.timezones.timezone) {
      return {
        hours: timeData.timezones.timezone.converted_time.strftime,
        date: timeData.timezones.timezone.converted_time.strfdate,
        city: timeData.timezones.timezone.converted_time.city.name,
        country: timeData.timezones.timezone.converted_time.city.country,
      }
    }

    return null
  }
}
