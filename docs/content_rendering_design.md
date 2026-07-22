# Content rendering design

## Rendering pipeline

```text
Markdown → react-markdown → remark-math → raw HTML parsing → article HTML policy
         → sanitization → table of contents → rehype-katex → Shiki HAST
         → static React output
```

`PostMarkdown` is an asynchronous server component. It completes all Markdown,
math, and code transformation before returning its React tree, so published
article content does not require client-side JavaScript. `react-markdown`'s
default URL sanitizer remains enabled.

Authored HTML is parsed with `rehype-raw`, validated against the explicit policy
in `src/lib/content/article-html-policy.ts`, and sanitized before trusted plugins
generate KaTeX and Shiki markup. The policy lists every permitted element and
attribute; arbitrary classes, styles, IDs, event handlers, scripts, forms, and
document-level elements are rejected. HTML written inside inline or fenced code
remains literal code. Policy violations fail content validation with the post
path instead of silently dropping authored content.

The initial authored profile covers semantic prose and tables, `details` and
`summary`, external HTTPS audio/video, and YouTube iframes. Disclosures require a
nonempty first summary. Audio and video receive controls and metadata preload and
cannot autoplay. YouTube embeds are the only accepted iframes, are normalized to
`youtube-nocookie.com`, and receive fixed lazy-loading, sandbox, permissions,
referrer, and responsive-layout properties. Adding a tag or embed provider
requires changing the central policy, validation tests, and authoring guide.

Rendered content uses the high-fidelity entry wireframe's `article-body`,
table-of-contents, `math-block`, figure, code-block, and link-card layout
contracts. Tailwind
Preflight removes browser list markers and default figure and quotation margins,
so those wireframe-dependent styles are restored explicitly rather than relying
on browser defaults.

## Headings and table of contents

During Markdown transformation, `h2`, `h3`, and `h4` headings receive deterministic
GitHub-compatible fragment IDs and are collected into a static table of contents.
Japanese characters are preserved, Latin text is lowercased, whitespace becomes
hyphens, and punctuation is removed. Duplicate normalized headings receive
`-1`, `-2`, and subsequent suffixes; a heading that otherwise produces an empty
slug uses `section` with the same uniqueness rule. Headings inside a `details`
element are intentionally excluded because their collapsed ancestor is not a
reliable navigation target.

The table of contents is rendered only when an eligible heading exists. It is an
always-expanded navigation region labeled 「目次」 between article metadata and
prose. Entries nest beneath the nearest preceding heading of a shallower level;
a heading without a preceding shallower heading remains top-level. Heading IDs and navigation are present in static HTML and
do not require client-side parsing, scrolling state, or JavaScript. Pagefind
ignores the navigation copy so heading text is indexed once from the article
content rather than duplicated by the table of contents.

Article typography also defines progressively smaller treatments for `h4`,
`h5`, and `h6`, but only levels through `h4` are added to the table of contents.
The first article-body element does not receive its normal top margin,
so an article beginning with a heading keeps the same opening rhythm as one
beginning with prose.

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

Fenced code uses its info string as the language. A fence may append a
whitespace-free filename after the first colon, such as `python:main.py`. The
language before the colon selects and validates the Shiki grammar, while the
code-block header displays only the filename. A language-only fence displays
its canonical language label. Inline code opts into syntax highlighting with a
trailing `{:language}` marker. Unmarked inline code remains a semantic `code`
element. Aliases such as `ts` resolve to their canonical grammar and both `ts`
and `typescript` display as `typescript`. Plain fenced blocks have no label. Any
unknown identifier fails content validation with its post and source line.

Raw article HTML may use the legacy `font` element only with a named or
hexadecimal `color` attribute. Font face, size, style, and event attributes
remain outside the authoring policy. A Markdown blockquote may use a final
paragraph beginning with an em dash as its source attribution; the renderer
moves it outside the quotation border and renders it as a right-aligned caption,
matching article image captions, without displaying the marker em dash.
Blockquotes scroll horizontally when an
unbreakable mathematical expression exceeds the reading column.

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
Metadata is refreshed explicitly into the tracked
`src/generated/link-previews.json` manifest from Open Graph or Twitter Card
tags. Production rendering reads only that manifest, so a deployment neither
contacts third-party sites nor loses an existing card during a transient
outage. Support YouTube, X, GitHub, and generic Open Graph pages. Fetch only
`https` URLs, enforce short time and response-size limits, and never fetch
private, loopback, or link-local network addresses.

Only a paragraph containing exactly one absolute `https` URL is a candidate.
Candidates are discovered from the Markdown syntax tree and deduplicated across
all published translations. Inline URLs, explicit Markdown links, `http` URLs,
and URLs with credentials are never fetched. Run `npm run
refresh:link-previews` after adding or changing a standalone URL. Content
validation rejects a published URL without generated metadata.

The refresh loader applies these limits to each preview attempt:

* 10-second total deadline, including DNS and response streaming
* 512 KiB maximum HTML head, with reading stopped after `</head>`
* 3 redirects, with full URL and network validation repeated for every hop
* successful `text/html` responses only

Refresh uses at most four concurrent requests and makes two attempts per URL.
If refresh fails for a URL already in the manifest, the previous metadata is
retained. A new uncached failure aborts the refresh without partially rewriting
the manifest. Entries that are no longer referenced are removed after a
successful refresh.

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
pages use `og:site_name` or the hostname. The rendered card always links to the
URL authored in Markdown rather than a temporary redirect destination. Missing
metadata, network errors, limit violations, and security rejections prevent a
new cache entry; they cannot remove a previously generated card.

A paragraph containing only an internal Markdown link such as
`[Related post](/blog/YYYY/YYYYMMDD-slug)` also becomes a card. Its title,
derived description, and image come directly from the validated target post
data, so no HTTP request is made. Internal links embedded in a sentence remain ordinary
anchors. If the target is unavailable, rendering falls back to the authored
Markdown link.

Link cards use a horizontal text-and-image layout when space permits. On phone
widths, the image moves above the text at a 16:9 ratio and the description wraps
so the card remains readable without horizontal overflow. Titles display at
most two lines and descriptions at most three lines. The complete fetched or
authored metadata remains in the static markup; these are visual clamps rather
than scraper-side character limits.
