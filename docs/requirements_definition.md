# Requirements definition

## Project overview

**monipy.org** is a personal website and blog documenting the author's learning
journey and ideas in technology, programming, mathematics, investing, personal
growth, and daily life.

The site title is **moni's page**, the displayed author is **moni**, and the
supported languages are Japanese (`ja`) and English (`en`). Japanese keeps
the existing unprefixed URLs and English uses `/en`. Dates are interpreted and displayed in
Japan Standard Time (`Asia/Tokyo`). Until final copy is supplied, use concise
synthetic Japanese text for the homepage introduction and default description.

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
* **Post:** title, date, category, tags, derived description, content, and comments.

## Post metadata

Required frontmatter:

```yaml
title: Learning TypeScript
date: 2026-05-03
category: Programming
tags:
  - typescript
  - learning
draft: false
```

Optional `image: cover.png` selects the Open Graph image; otherwise the
site-wide default at `public/cat.jpg` is used. Categories and tags are arbitrary
strings generated at build time. See `markdown_authoring_guide.md` for authoring
syntax.

The directory year and `YYYYMMDD` prefix must match the frontmatter date. Post
URLs are unique case-insensitively. Every post is validated during builds,
including drafts; see `content_loading_design.md` for validation behavior.

Each post receives a deterministic plain-text description derived from its
opening prose during content loading. Authors do not maintain a separate
description or summary field in frontmatter.

Posts may combine Markdown with the validated HTML profile documented in
`markdown_authoring_guide.md`. Unsupported elements, attributes, URL protocols,
and embed providers fail content validation rather than being published.

`index.md` is the required Japanese source. An optional `index.en.md` beside it
is the English translation and shares the directory slug and assets. Each file
contains complete frontmatter and has an independent draft state. Locale and
translation relationships are derived from filenames and directory structure.

## Search and comments

Pagefind indexes title, derived description, category, tags, and full article
content, and filters by category, tag, year, and month. Comments contain only
name and comment. Names contain 1-80 characters and comments contain 1-2,000 characters.
Comments are plain text with line breaks preserved, require moderation before
display, and have no email, website, login, or avatar. See their respective
design documents for behavior.

## Homepage AI guide

The prepared homepage interview remains static. After it completes, free-form
questions are sent to a same-origin Worker route backed by the `blog-helper`
Cloudflare AI Search instance. Answers stream as plain text, prioritize indexed
site content, and may use clearly distinguished general knowledge when the site
does not contain enough information. Up to three validated source links appear
below an answer.

Conversation state is browser-memory only and is forgotten on reload. The full
transcript remains visible, while only the latest three completed free-form
exchanges are sent as context. The application does not store or log questions
or answers.

## Platform requirements

Support light, dark, and system themes; Cloudflare Web Analytics; RSS;
`sitemap.xml`, `robots.txt`, canonical URLs, and Open Graph tags.

## Acceptance criteria

* Drafts are excluded from production post lists, feeds, search, sitemap, and direct public pages.
* Every published post has a canonical URL, RSS entry, sitemap entry, and Open Graph metadata.
* Search covers the stated fields and filters without a database.
* Submitted comments are invisible until approved; rejected comments never appear publicly.
* Reading posts remains usable without client-side JavaScript.
* Localized pages emit correct document language, canonical, language alternate,
  Open Graph locale, feed, sitemap, and search metadata.
* Language switching reaches the corresponding published translation when it
  exists. When English is unavailable, selecting English keeps the Japanese
  article visible and shows an English availability notice without an archive link.
* Every English article identifies itself as an AI translation, links to its
  Japanese original, and excludes the disclosure from Pagefind indexing.
* Valid homepage questions receive a localized, streamed AI response or a
  bounded localized failure without exposing provider access to the browser.
