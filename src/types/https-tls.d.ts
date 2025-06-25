declare module 'https-tls' {
  export interface HttpsOptions {
    ciphers?: string
    signatureAlgorithms?: string
    ecdhCurve?: string
    minVersion?: string
    maxVersion?: string
    [key: string]: any
  }

  function TLS(userAgent: string, httpsOpts?: HttpsOptions): HttpsOptions

  export default TLS
}
