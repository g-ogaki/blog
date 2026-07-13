# Deployment design

## Domain

```text
https://monipy.org
```

---

## Hosting

Cloudflare Workers.

---

## Build Pipeline

```text
git push
↓
Cloudflare Build
↓
OpenNext Worker Build
↓
Generate Static Pages
↓
Generate RSS
↓
Generate Sitemap
↓
Generate Pagefind Index
↓
Deploy
```

The deployment commands are provided by `@opennextjs/cloudflare`: build with
`opennextjs-cloudflare build`, preview with `opennextjs-cloudflare preview`,
and deploy with `opennextjs-cloudflare deploy`. The Worker uses the Next.js
Node.js runtime.

The repository scripts keep the raw Next.js build and Worker build separate
because OpenNext invokes `npm run build` internally:

```text
npm run build         # Next.js output
npm run build:worker  # .open-next/worker.js deployment artifact
```

Cloudflare Workers Builds uses these commands:

```text
Build command:   npm run build:worker
Deploy command:  npx @opennextjs/cloudflare deploy
Version command: npx @opennextjs/cloudflare upload
```

The deploy command promotes production builds. The version command uploads
non-production branch builds without promoting them. Do not use the repository's
`npm run deploy` in Workers Builds because that local convenience script runs
the Worker build again. Running only `npm run build` does not create the Worker
entry point required by Wrangler.

---

## Environment Variables

```text
DISCORD_WEBHOOK_URL
TURNSTILE_SECRET_KEY
IP_HASH_SECRET
```

Secrets are configured in Cloudflare, never committed, and are required only by
comment-related routes. Production and preview environments use different
secrets and Discord webhooks.

---

## Static Assets

Required global asset:

```text
public/cat.jpg
```

Used when a post does not specify an image in frontmatter.

Cloudflare Web Analytics is optional until the domain and analytics site are
registered. A missing analytics token must not fail local or preview builds.

## Static page cache

OpenNext uses its read-only Workers Static Assets incremental cache with cache
interception enabled. This is required for SSG routes because Markdown is read
from the repository only during the build and is not available through the
Worker runtime filesystem. Both `upload` preview versions and production
deployments must serve the populated build-time `/blog` cache entries rather
than attempting runtime regeneration.

## Release checks

Before deployment, the build must fail on invalid frontmatter, broken internal
links, missing referenced post images, or duplicate post URLs. Preview deploys
are used for human review before production.

## Scheduled cleanup

A daily Cloudflare Workers Cron Trigger deletes expired comment-system data as
defined in `comment_moderation_design.md`. It performs no content generation or
post-data writes.

---
