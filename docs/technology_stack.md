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

Shiki uses its fine-grained core bundle with the JavaScript regex engine, the
GitHub light/dark themes, and the TypeScript grammar. Add a grammar explicitly
when the authoring guide adds another supported fenced-code language; do not use
Shiki's full bundle in the Worker artifact.

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
* Cloudflare Vitest Workers integration with local D1
* ESLint
* GitHub Actions

`npm run test:unit` runs the jsdom suite. `npm run test:d1` applies repository
migrations to isolated local D1 storage in the Workers runtime. `npm test` runs
both; production or remote D1 is never used by automated tests.

---
