# search_design.md

## Search Engine

Pagefind

## Indexed Fields

* Title
* Derived description
* Category
* Tags
* Full content

## Build Flow

```text
Markdown
↓
Next.js build
↓
Pagefind indexing
↓
Deploy
```

`npm run build` runs Pagefind after `next build`, clears any previous index,
scans `.next/server/app`, and writes the generated browser index to the ignored
`public/pagefind/` directory.
`public/pagefind-loader.js` imports that generated API at runtime, keeping
Pagefind and the index out of the Worker script bundle.

Only published article pages carry `data-pagefind-body`. Their markup supplies
search metadata and filters, including a canonical `url` value so results do
not expose the `.html` filenames in Next.js's prerender directory.

## Filters

* Category
* Tag
* Year
* Month

Filtering is client-side and may require JavaScript. Article pages and their
content remain readable without client-side JavaScript. Before Pagefind loads,
or when its assets are unavailable, the complete published archive remains
visible and taxonomy links retain their stable URLs. Loading, searching, empty,
and unavailable states are announced in the interface. No database is required.

## URL Contract

```text
/blog?q=<query>
/blog?category=<category>
/blog?tag=<tag>&tag=<tag>
/blog?year=YYYY
/blog?month=YYYY-MM
```

Category, year, and month accept one value each. Tags accept multiple selections
as repeated `tag` parameters; an article must contain every selected tag. Search
text and filters can be combined, and the active state is reflected in the URL
with `history.replaceState`. Year and month form one date dimension: selecting a
year clears the active month, and selecting a month clears the active year.

With JavaScript active, matching articles are presented in batches of ten. The
visible count and 「さらに読み込む」 control are shown only while another batch
remains, and any query or filter change resets the batch. The server-rendered
fallback keeps the complete published list available when JavaScript is absent.

---
