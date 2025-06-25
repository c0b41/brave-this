# brave-this

This repository provides a utility for interacting with the Brave Search engine, allowing you to programmatically perform searches and parse various types of results such as organic links, knowledge graphs, news, videos, and more.

## Installation

```sh
pnpm add @c0b41/brave-this
```

## Search

```js
async function performSearch() {
    try {
        const results = await search({
            query: 'latest tech news',
            options: {
                safe: 'moderate',
                lang: 'en-US',
                page: 0,
                mobile: false
            }
        });

        console.log('Organic Results:', results.results ? .items);
        console.log('Knowledge Graph Title:', results.knowledges ? .title);
        console.log('News Articles:', results.news ? .items);
        console.log('Did You Mean:', results.didYouMean);

    } catch (error) {
        console.error('Search failed:', error);
    }
}

performSearch();
```

## Search Parameters

The SearchParams type defines the structure for the options object passed to the search

```js
type SearchParams = {
  query: string,
  options?: {
    safe?: 'off' | 'moderate' | 'strict', // Safe search filter
    search_lang?: string, // Search language (e.g., 'en-US')
    page?: number, // Page number for results (0-indexed)
    mobile?: boolean, // Set to true for a mobile user agent
    headers?: Headers, // Custom HTTP headers to send with the request
  },
}
```

## Search Results

The BraveSearchResult type is the shape of the object returned by the search function, containing parsed data for various result types:

```js
type BraveSearchResult = {
  results: OrganicResults | null,
  knowledges: KnowledgeGraph | null,
  news: News | null,
  videos: Videos | null,
  weather: Weather | null,
  time: Time | null,
  location: Location | null,
  dictionary: Dictionary | null,
  translation: Translation | null,
  converters: Converters | null,
  didYouMean: DidYouMean | null,
  relatedqueries: RelatedQuerys | null,
  discussions: Discussions | null,
}
```

Each property (e.g., OrganicResults, KnowledgeGraph) corresponds to a parser class (#nodes/organicresults, #nodes/knowledgegraph, etc.) that extracts and structures data from the raw Brave search response.

## Debugging

You can enable detailed debugging logs by setting the DEBUG environment variable. If process.env.DEBUG is set, the raw HTML content fetched from Brave Search will be written to ./data/data.html.

```sh
DEBUG=* node your_script.js
```
