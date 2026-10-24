export type URLS = {
  BRAVE: string
  BRAVE_DEFINITIONS: string
  FAVICONKIT: string
  GOOGLE_FAVICON: string
}

interface Constants {
  URLS: URLS
}

const constants = <Constants>{
  URLS: {
    BRAVE: 'https://search.brave.com/search',
    BRAVE_DEFINITIONS: 'https://search.brave.com/api/rhfetch/definitions',
    FAVICONKIT: 'https://api.faviconkit.com',
    GOOGLE_FAVICON: 'https://google.com/favicons',
  },
}

export default constants
