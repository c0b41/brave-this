import constants from '../../utils/constants'

export default class Weather {
  location: string | null
  forecast: string | null
  precipitation: string | null
  humidity: string | null
  temperature: string | null
  wind: string | null
  image: string | null

  constructor(private $: any, private data: string) {
    const weatherLocation = $(constants.SELECTORS.WEATHER_LOCATION).text().trim()
    const weatherForecast = $(constants.SELECTORS.WEATHER_FORECAST).text().trim()
    const precipitation = $(constants.SELECTORS.PRECIPITATION).text().trim()
    const airHumidity = $(constants.SELECTORS.AIR_HUMIDITY).text().trim()
    const temperature = $(constants.SELECTORS.TEMPERATURE).text().trim()
    const windSpeed = $(constants.SELECTORS.WIND_SPEED).text().trim()

    const isAvailable = Boolean(weatherLocation && weatherForecast)

    this.location = isAvailable ? weatherLocation : null
    this.forecast = isAvailable ? weatherForecast : null
    this.precipitation = isAvailable ? precipitation : null
    this.humidity = isAvailable ? airHumidity : null
    this.temperature = isAvailable ? temperature : null
    this.wind = isAvailable ? windSpeed : null

    // Extract image URL from raw HTML data
    if (isAvailable) {
      try {
        const scriptTagMatch = data.match(/<script(.*)wob_tci/gim)?.[0] || ''
        const imageMatch = scriptTagMatch.match(/var s='([^']+)'/im)
        this.image = imageMatch?.[1] || null
      } catch (e) {
        this.image = null
      }
    } else {
      this.image = null
    }
  }
}
