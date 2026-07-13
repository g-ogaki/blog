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

## Filters

* Category
* Tag
* Year
* Month

Filtering is client-side and may require JavaScript. Article pages and their
content remain readable without client-side JavaScript. No database is required.

---
