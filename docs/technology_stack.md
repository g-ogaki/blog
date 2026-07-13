# technology_stack.md

## Frontend

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
* rehype-katex
* KaTeX
* Shiki and its official rehype adapter
* htmlparser2 for tolerant link-preview metadata parsing
* ipaddr.js for SSRF address classification

Rendering is asynchronous on the server and produces static React output. Post
assets are copied to the public output during development and production builds;
no runtime content-file endpoint is used.

Link previews use the Node.js DNS and HTTPS APIs during static rendering. HTTPS
connections are pinned to DNS-vetted public addresses; no runtime Worker fetch
is used for preview metadata.

## Search

* Pagefind

Pagefind runs after the Next.js build and ships only its generated static index
and browser API. It is not imported into the Worker runtime and uses no database.

## Hosting

* Cloudflare Workers
* `@opennextjs/cloudflare` (OpenNext adapter and deployment CLI)
* Wrangler (Cloudflare bindings and local Worker support)

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

## Analytics

* Cloudflare Web Analytics

## Notifications

* Discord Webhook

## Testing and quality

* Vitest
* React Testing Library
* jsdom
* ESLint
* GitHub Actions

---
