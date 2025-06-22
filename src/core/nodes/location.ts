import constants from '#utils/constants'

export class LocationData {
  title: string | null
  distance: string | null
  map: string | null

  constructor(data: { title: string; distance: string; map: string }) {
    this.title = data.title
    this.distance = data.distance
    this.map = data.map
  }
}

export default class Location {
  static parse($: any): LocationData {
    const title = $(constants.SELECTORS.LOCATION_TITLE).text().trim()
    const distance = $(constants.SELECTORS.LOCATION_DISTANCE).text().trim()
    const imageSrc = $(constants.SELECTORS.LOCATION_IMAGE).attr('src')?.trim()

    const isAvailable = Boolean(title && distance)

    this.title = isAvailable ? title : null
    this.distance = isAvailable ? distance : null

    if (isAvailable && imageSrc) {
      // If imageSrc is already a full URL, use it directly
      this.map = imageSrc.startsWith('http') ? imageSrc : `https://example.com/maps/${imageSrc}`
    } else {
      this.map = null
    }

    return new LocationData({})
  }
}
