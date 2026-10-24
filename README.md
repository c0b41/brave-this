# brave-this

Unofficial Brave Search scraper. Performs searches against `search.brave.com`,
parses the embedded SvelteKit JSON payload, and returns structured results
(organic, knowledge graph, news, videos, dictionary, …).

## Install

```sh
pnpm add @c0b41/brave-this
```

## Search

```js
import { search } from '@c0b41/brave-this'

const results = await search({
  query: 'latest tech news',
  options: {
    safe: 'moderate',
    lang: 'en-US',
    page: 0,
    mobile: false,
  },
})

console.log(results.results) // organic
console.log(results.knowledges) // knowledge graph
console.log(results.news)
console.log(results.didYouMean)
```

## Search params

```ts
type SearchParams = {
  query: string
  options?: {
    safe?: 'off' | 'moderate' | 'strict' // → ?safe=
    lang?: string // → ?search_lang= (e.g. 'en-US')
    page?: number // 0-indexed; → ?offset=page*10
    mobile?: boolean // picks from the mobile UA pool
    userAgent?: string // explicit UA; overrides `mobile` and the pool
    headers?: Headers // custom headers; merged over the defaults
    debugDir?: string // per-request debug artifact directory
  }
}
```

### User agent

Three ways to control the outgoing `user-agent` header (priority top → bottom):

| Source                              | Effect                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `options.userAgent`                 | Explicit UA string. Used for both the HTTP header **and** the TLS fingerprint. |
| `options.headers` with `user-agent` | Same as above, but set through the header bag.                                 |
| `options.mobile`                    | Picks a random UA from the mobile pool instead of the desktop pool.            |
| _(unset)_                           | Picks a random UA from the desktop pool.                                       |

Examples:

```js
// Random desktop UA (default)
await search({ query: 'katy perry' })

// Random mobile UA
await search({ query: 'katy perry', options: { mobile: true } })

// Pinned UA — deterministic requests, stable TLS fingerprint
await search({
  query: 'katy perry',
  options: {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
})

// Pinned UA + extra headers
await search({
  query: 'katy perry',
  options: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    headers: new Headers({
      'accept-language': 'tr-TR,tr;q=0.9,en;q=0.8',
    }),
  },
})
```

### Custom headers

`options.headers` accepts either a `Headers` instance or a plain
`Record<string, string>`. Values are merged on top of the defaults, so you can
override any single header without having to rebuild the whole bag:

```js
await search({
  query: 'katy perry',
  options: {
    headers: {
      'accept-language': 'de-DE,de;q=0.9',
      'sec-ch-ua-platform': '"Linux"',
    },
  },
})
```

## Result shape

```ts
type BraveSearchResult = {
  results: OrganicResult[] | null
  knowledges: ParsedKnowledgeGraphData | null
  news: NewsItem[] | null
  videos: Video[] | null
  weather: WeatherData | null
  time: TimeData | null
  location: LocationData | null
  dictionary: DictionaryData | null
  translation: TranslationData | null
  converters: ConversionData | null
  didYouMean: DidYouMeanData | null
  relatedqueries: RelatedQueriesData | null
  discussions: Discussion[] | null
}
```

### `OrganicResult`

```ts
type OrganicResult = {
  title: string
  description: string
  url: string
  favicons: {
    high_res: string
    low_res: string
  }
  /** Human-readable age string (e.g. "2 hours ago"). Optional. */
  age?: string
  /** Sitelinks surfaced under the snippet (Wikipedia's "Life and career", …). Optional. */
  sitelinks?: { title: string; url: string }[]
}
```

### `ParsedKnowledgeGraphData`

```ts
type ParsedKnowledgeGraphData = {
  type: string | null
  title: string | null
  description: string[]
  url: string | null
  metadata: { title: string; value: string }[]
  ratings: { name: string; rating: string }[]
  available_on: string[]
  images: KnowledgeGraphImage[]
  links: { name: string; url: string; icon: string }[]
  /** Infobox action tabs ("Songs", "Albums", "Movies", …). Always present. */
  actions: string[]
}

type KnowledgeGraphImage = {
  url: string
  alt?: string
  original?: string
  click_url?: string
  logo?: boolean
  source: string | null
}
```

## Debugging

Everything is opt-in through environment variables.

| Variable                 | Effect                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `BRAVE_OUTPUT=1`         | Write per-request artifacts (`page.html`, `payload.js`, `payload.json`, `parsed.json`, `meta.json`) |
| `BRAVE_OUTPUT_DIR=/path` | Root directory for artifacts (default: `./data/debug`)                                              |
| `DEBUG=brave:*`          | All internal logs (`engine`, `http`, `artifacts`, `data`, `errors`)                                 |
| `DEBUG=brave:engine`     | Engine orchestration only                                                                           |
| `DEBUG=brave:http`       | HTTP layer only (headers, TLS, status)                                                              |
| `DEBUG=brave:data`       | Payload extraction only                                                                             |
| `DEBUG=brave:artifacts`  | File-write layer only                                                                               |

Each request produces a self-contained directory:

```
data/debug/2025-01-15T10-30-00-000Z_latest-tech-news_a1b2c3/
  page.html      # raw HTML from Brave
  payload.js     # extracted <script> content
  payload.json   # parsed RootObject (after Function evaluation)
  parsed.json    # final BraveSearchResult
  meta.json      # query, url, options, timestamp
```

### Example

```sh
BRAVE_OUTPUT=1 BRAVE_OUTPUT_DIR=/tmp/brave DEBUG=brave:* node script.js
```

### Per-request override

```js
await search({
  query: 'katy perry',
  options: { debugDir: '/tmp/brave/katy-perry' },
})
```

### Windows `cmd.exe` / PowerShell

`VAR=value command` is POSIX shell syntax. On Windows:

**cmd.exe:**

```cmd
set BRAVE_OUTPUT=1
set DEBUG=brave:*
node script.js
```

**PowerShell:**

```powershell
$env:BRAVE_OUTPUT='1'; $env:DEBUG='brave:*'; node script.js
```

**cross-env** (recommended for scripts in `package.json`):

```json
"scripts": {
  "debug": "cross-env BRAVE_OUTPUT=1 DEBUG=brave:* node ./examples/index.js"
}
```

Then `pnpm debug` works identically on Windows, macOS, and Linux.

## How it works

1. `BraveEngine.search()` builds the URL (`q`, `safe`, `search_lang`, `offset`)
   and calls `fetchHTML()` with a full browser-like header set.
2. `fetchHTML()` uses `undici` with an `https-tls` connector keyed on the
   selected user agent, so the TLS fingerprint matches the UA.
3. `extractJsData()` finds the SvelteKit `data: [...]` block in the returned
   HTML, evaluates it as JavaScript (Brave's own payload — no user input is
   ever evaluated), and returns the `RootObject`.
4. The 13 parsers walk that object and populate `BraveSearchResult`.

## Errors

All errors thrown by the public API are `SearchError` instances with `name`,
`message`, `info`, `date`, and `version` properties:

```ts
try {
  await search({ query: '' })
} catch (err) {
  if (err instanceof SearchError) {
    console.error(err.info) // { query: '' }
  }
}
```
