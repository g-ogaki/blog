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

Link-preview extraction is implemented separately in issue #6 and does not
change the safe Markdown renderer contract.
