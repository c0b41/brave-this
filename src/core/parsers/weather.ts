import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'

export interface WeatherLocation {
  city: string | null
  country: string | null
}

export interface WeatherForecast {
  main: string | null
  description: string | null
}

export interface WeatherData {
  location: WeatherLocation
  forecast: WeatherForecast
}

export function parse(_$: CheerioAPI, jsData: RootObject): WeatherData | null {
  const weatherData = jsData.data.body.response.rich?.results.find((item) => item.subtype === 'weather')
  if (!weatherData?.weather) return null

  return {
    location: {
      city: weatherData.weather.location.name,
      country: weatherData.weather.location.country,
    },
    forecast: {
      main: weatherData.weather.current_weather.weather.main,
      description: weatherData.weather.current_weather.weather.description,
    },
  }
}

export default { parse }
