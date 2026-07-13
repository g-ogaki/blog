# Routing design

## Public routes

Published Markdown posts generate these static routes:

```text
/blog
/blog/YYYY/YYYYMMDD-slug
/rss.xml
/sitemap.xml
/robots.txt
```

`/blog` lists published posts newest first. Post parameters are derived from the
validated content directories by `generateStaticParams`, and `dynamicParams` is
disabled. Public route loading always excludes drafts, including direct URL
lookups; a missing or draft path returns the Next.js not-found response.

The archive exposes stable taxonomy navigation URLs:

```text
/blog?category=<category>
/blog?tag=<tag>
/blog?year=YYYY
/blog?month=YYYY-MM
```

Taxonomy values are URL encoded. The site shell creates these links from
published post metadata. Pagefind activates their client-side filtering as part
of issue #10; until then they resolve to the complete, usable static archive.

OpenNext stores the generated listing and post responses in Workers Static
Assets and intercepts cache hits before invoking the Worker. Route correctness
must not depend on repository Markdown being available at runtime.

The build writes RSS 2.0, sitemap, and robots files into `public/` before Next.js
runs, so OpenNext deploys them as static assets instead of retaining the
filesystem content loader in the Worker bundle. RSS and sitemap entries are
derived from published posts only, use absolute `https://monipy.org` URLs, and
interpret frontmatter publication dates at JST midnight. The root metadata
advertises `/rss.xml` for feed discovery. Generated files are ignored by Git.

## Post output

The post route renders an `article` containing title, summary, category, JST
publication date, author, and the static `PostMarkdown` output. No client-side
JavaScript is required to read a post.

## Metadata

The canonical origin is `https://monipy.org`. Every post emits its title,
summary, canonical URL, article publication time, author, and Open Graph image.
An explicit frontmatter image maps to `/post-assets/<slug>/<image>`; otherwise
`/cat.jpg` is used. Root metadata defines Japanese language, site title, default
description, and the title template.
