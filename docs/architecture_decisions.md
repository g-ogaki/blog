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

External link-preview metadata is refreshed explicitly into a tracked generated
manifest. Production builds consume the validated manifest without contacting
third-party sites. Previously generated metadata is retained when a refresh
fails, and published standalone URLs require a manifest entry.

Reason:

* Keep static output deterministic across deployments
* Avoid runtime fetching and CORS issues
* Prevent transient provider failures from removing existing cards
* Keep metadata changes visible in code review

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

## ADR-014

The homepage remains statically rendered, but its post-hydration free-form site
guide is a narrow runtime exception backed by Cloudflare AI Search. The browser
calls a same-origin Next.js route, which uses a direct Worker binding and
transforms provider SSE into a bounded application protocol.

The prepared interview is never generated. Chat state lives only in React
memory, no chat data enters D1, and generated output is rendered only as text.
Source links come from validated `https://monipy.org` retrieval metadata. The
public AI Search endpoint remains disabled.

Reason:

* Keep provider capability and prompt policy server-side
* Preserve the static-first reading path and no-JavaScript experience
* Bound cost, abuse, history, output, and generated-content risk

The anonymous endpoint uses Cloudflare's approximate per-location rate-limit
binding at five requests per trusted client IP per minute. It relies on the
Workers AI free-plan daily allocation as its hard cost backstop; no durable
application quota or Turnstile challenge is added initially.

---

## ADR-015

Local article authoring uses a dependency-free Node.js supervisor around the
Next.js development server. It recursively watches `content/posts`, debounces
filesystem events, republishes assets, and regenerates Markdown-derived
metadata. Next.js keeps running for modifications to existing files and uses its
native development reload. A debounced file-inventory comparison restarts it
only after a persistent file addition, deletion, or rename is prepared
successfully. This avoids reconnecting remote Cloudflare bindings during normal
prose edits without missing changes to the content graph.

The development server reads the actively edited content tree. Invalid Markdown
may therefore show a development error until the next valid save; fast native
reload is preferred over maintaining a last-known-valid mirror.

External link-preview refresh remains an explicit author action because it
contacts third-party sites and changes a tracked manifest.

Reason:

* Preview Markdown, asset additions, replacements, renames, and deletions in one
  development session
* Avoid remote-binding reconnection during ordinary saves
* Rediscover new and removed routes and assets after structural changes
* Avoid another watcher or process-manager dependency
* Keep network-dependent generated metadata deliberate and reviewable

---
