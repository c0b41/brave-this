import { RootObject } from '#utils/brave'

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

export default class Videos {
  static parse($: any, jsData: RootObject): Video[] {
    let videos: Video[] = []

    let data = jsData.data.body.response.videos

    if (data) {
      videos = data.results.map((item: any) => {
        const url = item.url
        const title = item.title
        const author = item.video.creator || null
        const duration = item.video.duration || null
        const views = item.video.views || null
        return new Video({ url, title, author, duration, views })
      })
    }

    return videos
  }
}
