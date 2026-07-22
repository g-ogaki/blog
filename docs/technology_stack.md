# technology_stack.md

## Frontend

* Node.js 22 or later
* Next.js 16
* React 19
* TypeScript
* Tailwind CSS

## Content

* Markdown
* YAML
* Zod
* unified and remark-parse

## Rendering

* react-markdown
* remark-math
* remark-rehype and rehype-raw
* rehype-sanitize
* rehype-katex
* KaTeX
* Shiki and its official rehype adapter
* htmlparser2 for tolerant link-preview metadata parsing
* ipaddr.js for SSRF address classification

Rendering is asynchronous on the server and produces static React output. Post
assets are copied to the public output during development and production builds;
no runtime content-file endpoint is used. Local development uses a dependency-free
Node.js content watcher to republish assets, regenerate Markdown-derived metadata,
and restart Next.js only for persistent file additions, deletions, and renames.

Raw article HTML is parsed into HAST, checked against the explicit content-layer
policy, and sanitized before trusted KaTeX and Shiki transformations run. The
same policy is applied during synchronous content validation.

Shiki uses its fine-grained core bundle with the JavaScript regex engine and the
GitHub light/dark themes. Development exposes Shiki's full lazy language catalog
for immediate authoring feedback. Production scans published Markdown and
generates literal dynamic imports for only the canonical grammars in use; the
full language catalog must not enter the Worker artifact.

Link previews use the Node.js DNS and HTTPS APIs during static rendering. HTTPS
connections are pinned to DNS-vetted public addresses; no runtime Worker fetch
is used for preview metadata.

## Search

* Pagefind

Pagefind runs after the Next.js build and ships only its generated static index
and browser API. It is not imported into the Worker runtime and uses no database.

Cloudflare AI Search is used separately for the homepage's runtime site guide.
The Worker accesses the existing `blog-helper` instance through an instance
binding and proxies a bounded SSE contract; the AI Search public endpoint stays
disabled. The instance owns model and retrieval configuration.

## Hosting

* Cloudflare Workers
* `@opennextjs/cloudflare` (OpenNext adapter and deployment CLI)
* Wrangler (Cloudflare bindings and local Worker support)
* Cloudflare Workers Rate Limiting binding

Use the Next.js Node.js runtime with OpenNext; do not use the Next.js Edge
runtime. OpenNext is the approved deployment integration for this project.
Static pages use OpenNext's Workers Static Assets incremental-cache override and
cache interception; R2 is unnecessary while pages have no runtime revalidation.

## Database

* Cloudflare D1

Used only for:

* Comments
* Moderation

## Bot Protection

* Cloudflare Turnstile

The comment form explicitly renders the widget, handles error and expiry
callbacks, and resets it after every submission attempt because tokens are
single-use. Server-side Siteverify remains authoritative.

## Analytics

* Cloudflare Web Analytics

## Notifications

* Discord Webhook

The webhook is wrapped by an internal typed comment-notification service. It
sends bounded embeds with mentions disabled and is not exposed as a generic
application action.

## Testing and quality

* Vitest
* React Testing Library
* jsdom
* Cloudflare Vitest Workers integration with local D1
* ESLint
* GitHub Actions

`npm run test:unit` runs the jsdom suite. `npm run test:d1` applies repository
migrations to isolated local D1 storage in the Workers runtime. `npm test` runs
both; production or remote D1 is never used by automated tests.

---
