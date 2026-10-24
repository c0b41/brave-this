import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'

export interface TimeData {
  hours: string | null
  date: string | null
  city: string | null
  country: string | null
}

export function parse(_$: CheerioAPI, jsData: RootObject): TimeData | null {
  const timeData = jsData.data.body.response.rich?.results.find((item) => item.subtype === 'timezones')
  if (!timeData?.timezones?.timezone) return null

  const tz = timeData.timezones.timezone
  return {
    hours: tz.converted_time.strftime,
    date: tz.converted_time.strfdate,
    city: tz.converted_time.city.name,
    country: tz.converted_time.city.country,
  }
}

export default { parse }
