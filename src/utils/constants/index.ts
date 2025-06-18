export type URLS = {
  BRAVE: string
  FAVICONKIT: string
  GOOGLE_FAVICON: string
}
export type SELECTORS = {
  TITLE: string
  DESCRIPTION: string
  URL: string
  DID_YOU_MEAN: string
  KNO_PANEL_TITLE: string
  KNO_PANEL_DESCRIPTION: string[]
  KNO_PANEL_URL: string
  KNO_PANEL_METADATA: string
  KNO_PANEL_TYPE: string
  KNO_PANEL_SONG_LYRICS: string
  KNO_PANEL_AVAILABLE_ON: string
  KNO_PANEL_IMAGES: string
  KNO_PANEL_SONGS: string
  KNO_PANEL_BOOKS: string
  KNO_PANEL_TV_SHOWS_AND_MOVIES: string
  KNO_PANEL_FILM_GOOGLEUSERS_RATING: string
  KNO_PANEL_FILM_RATINGS: string[]
  KNO_PANEL_SOCIALS: string
  VIDEOS: string
  FEATURED_SNIPPET_TITLE: string[]
  FEATURED_SNIPPET_DESC: string[]
  FEATURED_SNIPPET_URL: string
  UNIT_CONVERTER_INPUT: string
  UNIT_CONVERTER_OUTPUT: string
  UNIT_CONVERTER_FORMULA: string
  INPUT_CURRENCY_NAME: string
  OUTPUT_CURRENCY_NAME: string
  CURRENCY_CONVERTER_INPUT: string
  CURRENCY_CONVERTER_OUTPUT: string
  WEATHER_LOCATION: string
  WEATHER_FORECAST: string
  PRECIPITATION: string
  AIR_HUMIDITY: string
  TEMPERATURE: string
  WIND_SPEED: string
  CURRENT_TIME_HOUR: string
  CURRENT_TIME_DATE: string
  LOCATION_TITLE: string
  LOCATION_DISTANCE: string
  LOCATION_IMAGE: string
  GD_WORD: string
  GD_PHONETIC: string
  GD_AUDIO: string
  GD_DEFINITIONS: string
  GD_EXAMPLES: string
  TR_SOURCE_LANGUAGE: string
  TR_TARGET_LANGUAGE: string
  TR_SOURCE_TEXT: string
  TR_TARGET_TEXT: string
  TOP_STORIES_DESCRIPTION: string[]
  TOP_STORIES_URL: string
  TOP_STORIES_SNIPPET: string
  TOP_STORIES_WEBSITE: string
  PAA: string[]
  PASF: string
  PUBLISHER: string
  STORY_TITLE: string
  STORY_IMG: string
  STORY_TIME: string
}

interface Constants {
  URLS: URLS
  SELECTORS: SELECTORS
}

const constants = <Constants>{
  URLS: {
    BRAVE: 'https://search.brave.com/search',
    FAVICONKIT: 'https://api.faviconkit.com',
    GOOGLE_FAVICON: `'https://google.com/favicons`,
  },
  SELECTORS: {
    // Organic Search Results
    TITLE: 'div.title',
    DESCRIPTION: 'div.snippet-description',
    URL: 'a.heading-serpresult',

    // Did You Mean
    DID_YOU_MEAN: '#altered-query > div > a:first',

    // Knowledge Panel
    KNO_PANEL_TITLE: 'div.infobox-header-title > a',
    KNO_PANEL_DESCRIPTION: ['div.infobox-header > div > h2', '#infobox > header > section'],
    KNO_PANEL_URL: 'div.infobox-header-title > a',
    KNO_PANEL_METADATA: '#infobox > section:nth-child(2) > div.wrapper-desktop > div',
    KNO_PANEL_TYPE: 'div.BkwXh > div',
    KNO_PANEL_SONG_LYRICS: 'div.ujudUb',
    KNO_PANEL_AVAILABLE_ON: 'div[class="ellip bclEt"]',
    KNO_PANEL_IMAGES: '.image-grid-item > a > img',
    KNO_PANEL_SONGS: 'a > div > div > div > div[class="title"]',
    KNO_PANEL_BOOKS: 'div[data-attrid="kc:/book/author:books only"] > a > div > div > div',
    KNO_PANEL_TV_SHOWS_AND_MOVIES: 'div[data-attrid="kc:/people/person:tv-shows-and-movies"] > a > div > div > div',
    KNO_PANEL_FILM_GOOGLEUSERS_RATING: 'div[data-attrid="kc:/ugc:thumbs_up"] > div > div > div',
    KNO_PANEL_FILM_RATINGS: ['span[class="gsrt KMdzJ"]', 'span[class="rhsB pVA7K"]'],
    KNO_PANEL_SOCIALS: '.infobox-profiles-body > a',

    VIDEOS: 'div.video-item',

    // Featured Snippet
    FEATURED_SNIPPET_TITLE: ['div[class="co8aDb gsrt"]', 'a[class="sXtWJb gsrt"]', 'div[class="Xv4xee"]'],
    FEATURED_SNIPPET_DESC: ['ol[class="X5LH0c"]', 'ul[class="i8Z77e"]', 'div[data-attrid="wa:/description"]'],
    FEATURED_SNIPPET_URL: 'div > div > div > div > div > h3 > div > span > a',

    // Unit converter
    UNIT_CONVERTER_INPUT: 'div.rpnBye > input',
    UNIT_CONVERTER_OUTPUT: 'div[id="NotFQb"] > input',
    UNIT_CONVERTER_FORMULA: 'div.bjhkR',
    INPUT_CURRENCY_NAME: 'span.vLqKYe',
    OUTPUT_CURRENCY_NAME: 'span.MWvIVe',
    CURRENCY_CONVERTER_INPUT: 'span.DFlfde.eNFL1',
    CURRENCY_CONVERTER_OUTPUT: 'span.DFlfde.SwHCTb',

    // Weather forecast
    WEATHER_LOCATION: 'div.wob_hdr > div[id="wob_loc"]',
    WEATHER_FORECAST: 'div.wob_dsc',
    PRECIPITATION: 'div.wob_dtf > div > span[id="wob_pp"]',
    AIR_HUMIDITY: 'div.wob_dtf > div > span[id="wob_hm"]',
    TEMPERATURE: 'div > span[id="wob_tm"]',
    WIND_SPEED: 'span[id="wob_ws"]',

    // Time result, E.g: try searching “what time is it in Japan?”
    CURRENT_TIME_HOUR: 'div#rh > div > h4 > span.time',
    CURRENT_TIME_DATE: 'div#rh > div > div',

    // Location result
    LOCATION_TITLE: 'div.vk_sh.vk_gy',
    LOCATION_DISTANCE: 'div.dDoNo.FzvWSb.vk_bk',
    LOCATION_IMAGE: 'div.vk_c > div > a > img',

    // Google Dictionary
    GD_WORD: 'span[data-dobid="hdw"]',
    GD_PHONETIC: 'div.qexShd',
    GD_AUDIO: 'audio > source',
    GD_DEFINITIONS: 'div[data-dobid="dfn"]',
    GD_EXAMPLES: 'div[class="ubHt5c"]',

    // Google Translator
    TR_SOURCE_LANGUAGE: 'div[class="j1iyq"] > span[class="source-language"]',
    TR_TARGET_LANGUAGE: 'div[class="j1iyq"] > span[class="target-language"]',

    TR_SOURCE_TEXT: 'pre[id="tw-source-text"] > span[class="Y2IQFc"]',
    TR_TARGET_TEXT: 'pre[id="tw-target-text"] > span[class="Y2IQFc"]',

    // Top Stories
    TOP_STORIES_DESCRIPTION: ['div.g5wfEd', 'div.VeOk3'],
    TOP_STORIES_URL: 'a.WlydOe.amp_r',
    TOP_STORIES_SNIPPET: 'div[class="g5wfEd"] > div[role="heading"]',
    TOP_STORIES_WEBSITE: 'div[class="g5wfEd"] > div > g-img > img',

    // “People also ask”
    PAA: ['div.s75CSd.u60jwe.gduDCb > span', 'div.gbCQS.u60jwe.gduDCb > div > span', 'div.JlqpRe > span'],

    // “People also search for”
    PASF: 'div[class="IHdOHf"] > img',

    // Top News
    PUBLISHER: 'a[data-n-tid="9"]',
    STORY_TITLE: 'a[class="DY5T1d RZIKme"]',
    STORY_IMG: 'img[class="tvs3Id QwxBBf"]',
    STORY_TIME: 'time',
  },
}

export default constants
