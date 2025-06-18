import constants from '../../utils/constants'

export class TimeData {
  hours: string | null
  date: string | null

  constructor(data: { hours: string; date: string }) {
    this.hours = data.hours
    this.date = data.date
  }
}

// Main class
export default class Time {
  static parse($: any): TimeData {
    const timeEl = $(constants.SELECTORS.CURRENT_TIME_HOUR)
    const dateEls = $(constants.SELECTORS.CURRENT_TIME_DATE)
      .map((_i: number, el: any) => $(el).text().trim())
      .get()

    let hours = timeEl.text() == '' ? null : timeEl.text().trim()
    let date = dateEls[1] ? dateEls[0] : null

    return new TimeData({ hours, date })
  }
}
