# Content rendering design

## Rendering pipeline

```text
Markdown → react-markdown → remark-math → rehype-katex → Shiki HAST → static React output
```

`PostMarkdown` is an asynchronous server component. It completes all Markdown,
math, and code transformation before returning its React tree, so published
article content does not require client-side JavaScript. Raw HTML in Markdown is
ignored, and `react-markdown`'s default URL sanitizer remains enabled.

Rendered content uses the high-fidelity entry wireframe's `article-body`,
table-of-contents, `math-block`, figure, code-block, and link-card layout
contracts. Tailwind
Preflight removes browser list markers and default figure and quotation margins,
so those wireframe-dependent styles are restored explicitly rather than relying
on browser defaults.

## Headings and table of contents

During Markdown transformation, `h2` and `h3` headings receive deterministic
GitHub-compatible fragment IDs and are collected into a static table of contents.
Japanese characters are preserved, Latin text is lowercased, whitespace becomes
hyphens, and punctuation is removed. Duplicate normalized headings receive
`-1`, `-2`, and subsequent suffixes; a heading that otherwise produces an empty
slug uses `section` with the same uniqueness rule.

The table of contents is rendered only when an eligible heading exists. It is an
always-expanded navigation region labeled 「目次」 between article metadata and
prose. `h3` entries nest beneath the preceding `h2`; an `h3` without a preceding
`h2` remains top-level. Heading IDs and navigation are present in static HTML and
do not require client-side parsing, scrolling state, or JavaScript. Pagefind
ignores the navigation copy so heading text is indexed once from the article
content rather than duplicated by the table of contents.

## Mathematics and code

Use `remark-math` and `rehype-katex` for inline and block mathematics, and
Shiki's official rehype adapter for fenced code blocks and language-marked
inline code. Shiki emits both GitHub light and dark theme variables; CSS selects
the appropriate values from the user's color-scheme preference. The highlighter
initializes with plain text only and loads requested language grammars on demand.
Development uses Shiki's full lazy catalog. Before a production Next.js build,
published Markdown is scanned and a deterministic registry of literal grammar
imports is generated, so the Worker includes only languages used by published
posts. Draft-only languages are available in development but excluded from the
production registry.

Fenced code uses its info string as the language. Inline code opts into syntax
highlighting with a trailing `{:language}` marker. Unmarked inline code remains
a semantic `code` element. A language-marked fenced block displays a compact
language label above the highlighted code; aliases such as `ts` resolve to their
canonical grammar and both `ts` and `typescript` display as `typescript`. Plain
fenced blocks have no label. Any Shiki language identifier may be used; an
unknown identifier fails content validation with its post and source line.

## Images and Open Graph

Images are colocated with a post's `index.md`. Every published page generates
title, description, canonical URL, and Open Graph metadata. The OGP-image
frontmatter and fallback priority are defined in `requirements_definition.md`;
the fallback is `public/cat.jpg`.

Before development or a production build, `publish-post-assets.ts` copies
colocated files other than `index.md` to
`public/post-assets/<year>/<post-directory>/...`. The generated directory is
ignored by Git. Relative Markdown image and file URLs are rewritten to that
public path. Development includes draft assets; production publication excludes
draft assets even though drafts are still validated.

A standalone Markdown image with a title renders as a semantic `figure`: the
title becomes a visible `figcaption` and is removed from the image tooltip to
avoid duplicate presentation. An untitled image remains an ordinary image.

## Link cards

A standalone URL paragraph becomes a link card; inline links stay hyperlinks.
Metadata is fetched only at build time from Open Graph or Twitter Card tags.
Support YouTube, X, GitHub, and generic Open Graph pages; fall back to a normal
link when metadata is absent or unavailable. Fetch only `https` URLs, enforce
short time and response-size limits, and never fetch private, loopback, or
link-local network addresses.

Only a paragraph containing exactly one absolute `https` URL is a candidate.
Candidates are discovered from the Markdown syntax tree, deduplicated per post,
and cached by URL for the lifetime of the build process. Inline URLs, explicit
Markdown links, `http` URLs, and URLs with credentials are never fetched.

The loader applies these limits to each preview operation:

* 3-second total deadline, including DNS and response streaming
* 512 KiB maximum response body, with `Content-Length` preflight when present
* 3 redirects, with full URL and network validation repeated for every hop
* successful `text/html` responses only

DNS resolution is conservative: every returned address must be globally
routable. Private, loopback, link-local, carrier-grade NAT, multicast, reserved,
documentation, and IPv4-mapped private IPv6 addresses are rejected. The HTTPS
connection is pinned to one validated address while preserving the original
hostname for the `Host` header and TLS certificate verification, preventing a
second unvalidated DNS lookup. Redirect response bodies are released before the
next hop.

Metadata precedence is Open Graph, then Twitter Card, then the HTML `title` and
description tag. Relative preview images resolve against the final URL and must
use HTTPS. YouTube, X, and GitHub hosts receive stable provider labels; generic
pages use `og:site_name` or the hostname. Missing metadata, network errors, limit
violations, and security rejections all produce a normal HTTPS hyperlink so a
third-party failure cannot fail the site build.

A paragraph containing only an internal Markdown link such as
`[Related post](/blog/YYYY/YYYYMMDD-slug)` also becomes a card. Its title,
summary, and image come directly from the validated target post metadata, so no
HTTP request is made. Internal links embedded in a sentence remain ordinary
anchors. If the target is unavailable, rendering falls back to the authored
Markdown link.

Link cards use a horizontal text-and-image layout when space permits. On phone
widths, the image moves above the text at a 16:9 ratio and the description wraps
so the card remains readable without horizontal overflow. Titles display at
most two lines and descriptions at most three lines. The complete fetched or
authored metadata remains in the static markup; these are visual clamps rather
than scraper-side character limits.
