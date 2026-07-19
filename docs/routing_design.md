# Routing design

## Public routes

Published Markdown posts generate these static routes:

```text
/blog
/blog/YYYY/YYYYMMDD-slug
/en
/en/blog
/en/blog/YYYY/YYYYMMDD-slug
/rss.xml
/en/rss.xml
/sitemap.xml
/robots.txt
```

`/blog` lists published posts newest first. Post parameters are derived from the
validated content directories by `generateStaticParams`, and `dynamicParams` is
disabled. Public route loading always excludes drafts, including direct URL
lookups; a missing or draft path returns the Next.js not-found response.

Japanese is the default locale and retains all existing URLs. English uses the
`/en` prefix. A request to `/` uses the saved `site_locale` cookie and then
`Accept-Language` to redirect English preference to `/en`. Explicit localized
URLs are never redirected. The language selector stores a one-year preference
cookie and navigates to the published counterpart when it exists. If English is
unavailable for a Japanese article, selecting English returns to the same
Japanese URL and renders an English availability notice without an archive link.

The archive exposes stable taxonomy navigation URLs:

```text
/blog?q=<query>
/blog?category=<category>
/blog?tag=<tag>&tag=<tag>
/blog?year=YYYY
/blog?month=YYYY-MM

/en/blog?q=<query>
```

Search and taxonomy values are URL encoded. Pagefind reads these parameters and
performs client-side keyword search and filtering. Without JavaScript or before
the search index is available, taxonomy URLs still resolve to the complete,
usable static archive. The archive UI treats year and month as mutually
exclusive filters and only writes one of those parameters at a time. Category
remains single-select; repeated tag parameters represent a multi-selection and
use AND semantics, so matching articles contain every selected tag.

OpenNext stores the generated listing and post responses in Workers Static
Assets and intercepts cache hits before invoking the Worker. Route correctness
must not depend on repository Markdown being available at runtime.

The build writes localized RSS 2.0 feeds, sitemap, and robots files into `public/` before Next.js
runs, so OpenNext deploys them as static assets instead of retaining the
filesystem content loader in the Worker bundle. RSS and sitemap entries are
derived from published posts only, use absolute `https://monipy.org` URLs, and
interpret frontmatter publication dates at JST midnight. The root metadata
advertises the current locale's feed. Generated files are ignored by Git.

## Post output

The post route renders an `article` containing title, derived description metadata, category, JST
publication date, author, and the static `PostMarkdown` output. No client-side
JavaScript is required to read a post. After hydration, a separate client-only
section fetches approved comments and exposes the Turnstile-protected submission
form; failure of that dynamic section does not affect article rendering.

## Metadata

The canonical origin is `https://monipy.org`. Every post emits its title,
derived description, canonical URL, article publication time, author, and Open Graph image.
An explicit frontmatter image maps to `/post-assets/<slug>/<image>`; otherwise
`/cat.jpg` is used. Every localized page emits a self canonical and alternates
only for published translations. Root layouts define the correct document
language, localized default description, site title, and title template.
