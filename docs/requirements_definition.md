# requirements_definition.md

## Project Overview

**monipy.org** is a personal website and blog that documents the author's learning journey, explores ideas in technology, programming, mathematics, investing, and personal growth, and occasionally shares thoughts about daily life.

The site is intended for readers who enjoy following someone's learning process and are interested in technology, programming, mathematics, investing, and self-improvement.

---

## Goals

* Publish articles written in Markdown.
* Maintain complete ownership of content.
* Keep infrastructure simple and low-maintenance.
* Prioritize static generation wherever possible.
* Support mathematical expressions and code-heavy articles.
* Provide search and filtering functionality.
* Allow moderated comments without requiring user accounts.

---

## Non-Goals

* CMS or admin dashboard.
* User registration.
* Social features.
* Real-time content editing.
* Nested comments.
* Portfolio functionality.

---

## Site Structure

### Home

Contains:

* Personal introduction
* Site description
* Recent posts (latest 5 posts)

### Blog

Contains:

* Post list
* Search
* Category filter
* Tag filter
* Year filter
* Month filter

### Post Page

Contains:

* Title
* Publication date
* Category
* Tags
* Summary
* Content
* Comments section

---

## Post Metadata

Required:

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

Optional:

```yaml
image: cover.png
```

Used as the Open Graph image when present.

---

## Categories

Categories are arbitrary strings.

Examples:

* Programming
* Mathematics
* Learning
* Investing
* Life
* Rust

Category lists are generated automatically during build.

---

## Tags

Tags are arbitrary strings.

Tags are generated automatically during build.

---

## Search

Implemented using Pagefind.

Searches:

* Title
* Summary
* Category
* Tags
* Full article content

Filters:

* Category
* Tag
* Year
* Month

---

## Comments

Fields:

* Name
* Comment

No:

* Email
* Website
* Login
* Avatar

Moderation required before publication.

---

## Themes

Supported themes:

* Light
* Dark
* System

---

## Analytics

Cloudflare Web Analytics.

---

## RSS

RSS feed available.

---

## SEO

Support:

* sitemap.xml
* robots.txt
* Open Graph tags
* Canonical URLs

---