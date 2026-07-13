# Content rendering design

## Rendering pipeline

```text
Markdown → parse → math rendering → code highlighting → link-preview extraction → HTML
```

## Mathematics and code

Use `remark-math` and `rehype-katex` for inline and block mathematics, and
Shiki for inline code and fenced code blocks.

## Images and Open Graph

Images are colocated with a post's `index.md`. Every published page generates
title, description, canonical URL, and Open Graph metadata. The OGP-image
frontmatter and fallback priority are defined in `requirements_definition.md`;
the fallback is `public/cat.jpg`.

## Link cards

A standalone URL paragraph becomes a link card; inline links stay hyperlinks.
Metadata is fetched only at build time from Open Graph or Twitter Card tags.
Support YouTube, X, GitHub, and generic Open Graph pages; fall back to a normal
link when metadata is absent or unavailable. Fetch only `https` URLs, enforce
short time and response-size limits, and never fetch private, loopback, or
link-local network addresses.
