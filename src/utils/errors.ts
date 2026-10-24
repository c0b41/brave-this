import debug from 'debug'

const debugErrors = debug('brave:errors')

export class SearchError extends Error {
  info?: Record<string, unknown>
  date: Date
  version: string

  constructor(message: string, info?: Record<string, unknown>) {
    super(message)
    this.name = 'SearchError'
    this.date = new Date()
    // Avoid a hard build-time dependency on package.json shape.
    this.version = (process.env.npm_package_version as string) || '0.0.0'
    if (info) this.info = info
    debugErrors('SearchError: %s info=%O', message, info)
  }
}
