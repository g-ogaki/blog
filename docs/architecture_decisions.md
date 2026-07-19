# architecture_decisions.md

## ADR-001

Posts are stored as Markdown files.

Reason:

* Git-friendly
* Simple workflow
* No CMS

---

## ADR-002

Markdown is the single source of truth.

Reason:

* Avoid synchronization issues
* Easy backups
* Easy version control

---

## ADR-003

D1 is used only for comments.

Reason:

* Dynamic functionality only
* Keep content static

---

## ADR-004

Search uses Pagefind.

Reason:

* Full-content search
* Static deployment
* No database

---

## ADR-005

Comment moderation uses Discord.

Reason:

* Existing workflow
* No email infrastructure
* Immediate notifications

---

## ADR-006

Link previews are generated at build time.

Reason:

* Avoid runtime fetching
* Avoid CORS issues
* Faster page rendering

---

## ADR-007

No user accounts.

Reason:

* Simplicity
* Low maintenance
* Privacy

---

## ADR-008

Open Graph images are selected using an explicit frontmatter field.

Reason:

- Predictable behavior
- Avoid accidental thumbnail selection
- Keep author control

Priority:

1. frontmatter image
2. site-wide default image

---

## ADR-009

Comment moderation state changes require a confirmed `POST` request.

Reason:

* Link previews and crawlers may follow `GET` links
* Prevent accidental approval or rejection
* One-time tokens can be consumed atomically

---

## ADR-010

Comment-system data follows a minimal retention schedule and is deleted by a
daily Worker Cron Trigger.

Reason:

* Keep only the data needed for public discussion and short-term abuse control
* Limit retention of pseudonymous IP-derived data
* Avoid a manual cleanup burden

---

## ADR-011

Japanese keeps the existing unprefixed routes and English uses the `/en`
prefix. Translations use separate static URLs and advertise one another with
language alternates; query parameters are not used to select content language.

Reason:

* Preserve existing Japanese links
* Keep canonical and language metadata unambiguous
* Allow Pagefind to build native per-language indexes

---

## ADR-012

An article directory is the language-independent article identity. `index.md`
is the required Japanese source and `index.en.md` is its optional English
translation. Files in the directory are shared by both translations, and both
URLs use the same date and slug.

Each translation has its own frontmatter and draft state. Content language is
derived from the source filename rather than duplicated in frontmatter.

---

## ADR-013

Language preference never changes the content returned by a canonical article
or archive URL. Browser language is used only when entering at `/`; explicit
pages offer a progressive suggestion and a static language link.

When a visitor selects English from a Japanese-only article, the preference is
saved but the visitor returns to that Japanese article. The progressive notice
states in English that no English translation exists and offers no substitute
archive link. Available translations still navigate directly to one another.

Reason:

* Preserve crawlability and shared-link intent
* Prevent untranslated article links from silently becoming archive links
* Keep localized pages static and readable without JavaScript

---
