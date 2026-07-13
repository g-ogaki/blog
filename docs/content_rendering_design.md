# Content rendering design

## Rendering pipeline

```text
Markdown → react-markdown → remark-math → rehype-katex → Shiki HAST → static React output
```

`PostMarkdown` is an asynchronous server component. It completes all Markdown,
math, and code transformation before returning its React tree, so published
article content does not require client-side JavaScript. Raw HTML in Markdown is
ignored, and `react-markdown`'s default URL sanitizer remains enabled.

## Mathematics and code

Use `remark-math` and `rehype-katex` for inline and block mathematics, and
Shiki's official rehype adapter for fenced code blocks and language-marked
inline code. Shiki emits both GitHub light and dark theme variables; CSS selects
the appropriate values from the user's color-scheme preference. The highlighter
initializes with plain text only and loads requested language grammars on demand
to avoid paying the full bundled-language startup cost for ordinary Markdown.

Fenced code uses its info string as the language. Inline code opts into syntax
highlighting with a trailing `{:language}` marker. Unmarked inline code remains
a semantic `code` element.

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
so the card remains readable without horizontal overflow.
