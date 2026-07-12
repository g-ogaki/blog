# Requirements definition

## Project overview

**monipy.org** is a personal website and blog documenting the author's learning
journey and ideas in technology, programming, mathematics, investing, personal
growth, and daily life.

## Goals

* Publish Markdown articles with complete content ownership.
* Keep infrastructure static-first, simple, and low-maintenance.
* Support mathematics, code-heavy articles, search, filtering, and moderated comments.

## Non-goals

No CMS/admin dashboard, user registration, social features, real-time editing,
nested comments, or portfolio functionality.

## Site structure

* **Home:** personal introduction, site description, latest five posts.
* **Blog:** post list, Pagefind search, category/tag/year/month filters.
* **Post:** title, date, category, tags, summary, content, and comments.

## Post metadata

Required frontmatter:

```yaml
title: Learning TypeScript
date: 2026-05-03
category: Programming
tags:
  - typescript
  - learning
summary: Notes from learning TypeScript.
draft: false
```

Optional `image: cover.png` selects the Open Graph image; otherwise the
site-wide default is used. Categories and tags are arbitrary strings generated
at build time. See `markdown_authoring_guide.md` for authoring syntax.

## Search and comments

Pagefind indexes title, summary, category, tags, and full article content, and
filters by category, tag, year, and month. Comments contain only name and
comment, require moderation before display, and have no email, website, login,
or avatar. See their respective design documents for behavior.

## Platform requirements

Support light, dark, and system themes; Cloudflare Web Analytics; RSS;
`sitemap.xml`, `robots.txt`, canonical URLs, and Open Graph tags.

## Acceptance criteria

* Drafts are excluded from production post lists, feeds, search, sitemap, and direct public pages.
* Every published post has a canonical URL, RSS entry, sitemap entry, and Open Graph metadata.
* Search covers the stated fields and filters without a database.
* Submitted comments are invisible until approved; rejected comments never appear publicly.
* Reading posts remains usable without client-side JavaScript.
