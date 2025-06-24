import { RootObject } from '#utils/brave'
import { CheerioAPI } from 'cheerio'

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
  //precipitation: string | null
  //humidity: string | null
  //temperature: string | null
  //wind: string | null
  //icon: string | null TODO: icon dynamic generated in js file
}

export default class Weather {
  static parse($: CheerioAPI, jsData: RootObject): WeatherData | null {
    let weatherData = jsData.data.body.response.rich?.results.find((item) => item.subtype == 'weather')

    if (weatherData && weatherData.weather) {
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

    return null
  }
}
