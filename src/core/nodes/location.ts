import { RootObject } from '#utils/brave'

export interface LocationData {
  title: string | null
  distance: string | null
  map: string | null
}

export default class Location {
  static parse($: any, jsData: RootObject): LocationData | null {
    // not supported
    return null
  }
}
