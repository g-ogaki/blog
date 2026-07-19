# Content loading design

## Discovery

Posts are discovered synchronously at build time from:

```text
content/posts/YYYY/YYYYMMDD-slug/index.md
content/posts/YYYY/YYYYMMDD-slug/index.en.md
```

`index.md` is required and represents Japanese; `index.en.md` is optional and
represents English. The shared directory is the article identity. The year and
`YYYYMMDD` directory prefix must match each file's frontmatter date. The
canonical slug is `YYYY/YYYYMMDD-slug`; URLs are `/blog/<slug>` and
`/en/blog/<slug>`.

## Validation

Every translation, including a draft, must have valid YAML frontmatter and a valid
calendar date. Frontmatter accepts only the required fields documented in
`requirements_definition.md` and the optional `image` field.

Frontmatter images, Markdown images, and relative file links must resolve to
files inside the post directory. Internal links beginning with `/blog/` or
`/en/blog/` must identify a discovered translation. In production validation,
a published translation cannot link to a draft-only translation. External URLs,
fragment links, and application routes
outside `/blog/` are not resolved by the content loader.

Raw article HTML is parsed with the same policy used by the renderer. Unsupported
elements and attributes, unsafe URL protocols, malformed disclosure structure,
non-YouTube iframes, and autoplay media stop the build with the source path.
Raw HTML links follow the Markdown link contract, and raw images must reference
validated files colocated with the post. Authored audio and video sources are
the deliberate exception: they must be absolute HTTPS URLs.

Validation runs during `npm run check`, `npm run build`, and the OpenNext Worker
build. Failures include the source path and stop the build.

## Derived descriptions

Each post receives one canonical `description` during content loading. Ordinary
top-level Markdown paragraphs are considered in document order and their text
is joined with single spaces until the description limit is reached. Visible
text, emphasis content, link labels, and inline-code text are retained. Headings,
lists, blockquotes, images, raw HTML, inline and block mathematics, code blocks,
standalone links, standalone URLs, and paragraphs containing only inline code
are ignored.

Whitespace is collapsed before measuring. Descriptions contain at most 120
Unicode grapheme clusters. Longer text keeps the first 119 clusters and appends
`…`, so Japanese text and emoji are not split. When no suitable paragraph text
exists, the deterministic fallback is `「<title>」についての記事です。` for
Japanese and `An article about “<title>”.` for English.

This derived value is produced for drafts as well as published posts and is
reused for page metadata, Open Graph metadata, Pagefind metadata, RSS, and
internal link cards. Consumers do not parse Markdown independently.

## Drafts

Draft metadata and local files are always validated. Drafts may be returned for
local development but are excluded from production loading, public routes,
feeds, search, and sitemap generation.

## Asset publication

Validated non-Markdown files colocated with the translation sources are published once under
`public/post-assets/<slug>/`. Production publication receives only non-draft
articles; local development includes drafts. Markdown sources are never copied, and stale
generated assets are removed before each publication. Rendering rewrites
relative Markdown URLs to the matching `/post-assets/<slug>/...` URL.
