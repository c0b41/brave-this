import type { CheerioAPI } from 'cheerio'
import type { RootObject } from '#utils/brave'
import type { VideoResult } from '#utils/brave/types'

export class Video {
  url: string
  title: string
  author: string
  views: string
  duration: string

  constructor(data: { url: string; title: string; author: string; duration: string; views: string }) {
    this.url = data.url
    this.title = data.title
    this.author = data.author
    this.duration = data.duration
    this.views = data.views
  }
}

export function parse(_$: CheerioAPI, jsData: RootObject): Video[] {
  const data = jsData.data.body.response.videos
  if (!data?.results || !Array.isArray(data.results) || data.results.length === 0) {
    return []
  }

  return data.results.map((item: VideoResult) => {
    return new Video({
      url: item.url,
      title: item.title,
      author: item.video?.creator ?? '',
      duration: item.video?.duration ?? '',
      views: item.video?.views ?? '',
    })
  })
}

export default { parse }
