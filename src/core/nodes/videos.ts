import constants from '../../utils/constants'

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
  static parse($: any, data: []): Video[] {
    let videos: Video[] = []

    let metadata = data[1].data.body.response.videos

    videos = metadata.results.map((item: any) => {
      const url = item.url
      const title = item.title
      const author = item.video.creator || null
      const duration = item.video.duration || null
      const views = item.video.views || null
      return new Video({ url, title, author, duration, views })
    })

    return videos
  }
}
