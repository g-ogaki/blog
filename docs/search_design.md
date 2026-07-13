# search_design.md

## Search Engine

Pagefind

## Indexed Fields

* Title
* Summary
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
/blog?tag=<tag>
/blog?year=YYYY
/blog?month=YYYY-MM
```

One value per filter dimension is supported. Search text and filters can be
combined, and the active state is reflected in the URL with `history.replaceState`.

---
