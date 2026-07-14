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
Node.js runtime. Local development and GitHub CI require Node.js 22 or later,
matching Wrangler and the Cloudflare Workers Builds environment.

The repository scripts keep the raw Next.js build and Worker build separate
because OpenNext invokes `npm run build` internally:

```text
npm run build         # Next.js output
npm run build:worker  # .open-next/worker.js deployment artifact
```

`npm run build` validates content, publishes colocated post assets, writes
`public/rss.xml`, `public/sitemap.xml`, and `public/robots.txt`, invokes Next.js,
then generates `public/pagefind/` from the prerendered HTML. Keeping these
content-derived outputs as public files prevents the filesystem Markdown loader,
parser, and Pagefind dependencies from entering the Worker runtime bundle.
Shiki is composed from fine-grained theme and language imports so unused grammar
catalogs are likewise excluded from the Worker artifact.

After OpenNext finishes, `npm run build:worker` runs `verify:release`. The
verification fails unless the output contains a non-empty Worker entry point,
RSS, sitemap, robots file, default Open Graph image, required static headers,
Pagefind browser files and index, the home/blog caches, and one cache entry for
every published post in the build-generated manifest. This is an artifact
check, not a source-tree check, so it detects files lost between Next.js and the
deployable `.open-next` output.

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

These values are secrets configured in Cloudflare, never committed, and
required only by comment-related routes. `wrangler.jsonc` declares their names
under `secrets.required` so local Wrangler validation and generated binding
types describe the runtime contract without containing secret values.

`DISCORD_WEBHOOK_URL` is consumed only by the internal typed comment notifier;
there is no generic webhook server action. The notifier treats network,
timeout, rate-limit, and other non-success responses as delivery failures.

The Turnstile widget also requires this non-secret, build-time variable:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

Next.js exposes it to the browser for the comment UI. `TURNSTILE_SECRET_KEY`
remains server-only and must never use the `NEXT_PUBLIC_` prefix.

The comment API reads secrets from Cloudflare runtime bindings in deployed
Workers and from Next.js `process.env` during `npm run dev`. The local `.env`
names therefore match the production binding names; neither value is exposed to
client code.

For local form testing, use Cloudflare's paired Turnstile test sitekey and
secret in `.env.development`, or explicitly allow `localhost` on a non-production
widget. Never use Turnstile test credentials in production.

### Preview isolation

Workers Builds branch previews are uploaded versions of the same `blog` Worker.
They isolate the code version and URL, but inherit that Worker's runtime
bindings: the production D1 database and runtime secrets. A preview comment is
therefore a real database write and sends through the configured Discord
webhook. Turnstile must allow the exact preview hostname before the widget can
be exercised. Prefer read-only content/UI review on previews; when an end-to-end
comment test is necessary, use clearly synthetic text and reject it after the
test.

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` is embedded at build time and must be available
to branch builds as well as production builds. Cloudflare dashboard variables
and secrets remain the source of truth; never add their values to
`wrangler.jsonc` or the repository. Fully isolated preview comments would
require a separately named Worker, D1 database, secrets, webhook, and Turnstile
widget, and are intentionally outside the current single-Worker setup.

---

## Static Assets

Required global asset:

```text
public/cat.jpg
```

Used when a post does not specify an image in frontmatter.

The generated `public/pagefind/` directory is ignored by Git and rebuilt for
every deployment. OpenNext copies it into Workers Static Assets together with
the tracked `public/pagefind-loader.js` browser entry point.

Cloudflare Web Analytics is enabled for the proxied `monipy.org` hostname from
the Cloudflare dashboard. Cloudflare injects the beacon at the edge, so the
application contains no analytics script or token. Local development and
Workers preview URLs require no analytics configuration and are not part of the
production analytics site. Do not add `no-transform` to HTML `Cache-Control`
headers because it prevents Cloudflare's automatic beacon injection.

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

GitHub CI runs:

```text
npm run check
npm run build:worker
npm run verify:deployment
```

The final command repeats the release artifact contract and asks Wrangler to
bundle the exact configuration with `deploy --dry-run`. This validates the
Worker entry point, declared bindings, and compressed bundle size without
contacting production. CI never reads production secrets or connects to remote
D1.

### Preview review

1. Confirm GitHub CI and the Workers Builds preview both pass.
2. Open the branch preview URL and review `/`, `/blog`, and every changed post.
3. Verify search returns a known title/body match and its filters still work.
4. Open `/rss.xml`, `/sitemap.xml`, and `/robots.txt` from the preview URL.
5. Check responsive layout, theme switching, images, link cards, code, and math
   when the pull request changes those areas.
6. Treat comment submission as a production D1 write under the current shared
   binding model; test it only when the change requires it.

### Production release

1. Merge only after the preview and CI checks pass.
2. Apply reviewed forward-only D1 migrations deliberately before code that
   depends on them; builds never run migrations.
3. Confirm Cloudflare has the three required runtime secrets and the public
   Turnstile build variable.
4. Confirm the `DB`, `ASSETS`, `IMAGES`, and `WORKER_SELF_REFERENCE` bindings and
   the `0 3 * * *` Cron Trigger in the uploaded version.
5. After deployment, smoke-test the canonical domain, a post, Pagefind, RSS,
   sitemap, robots, and the comment list. Confirm Web Analytics remains enabled
   at the Cloudflare edge.

## Scheduled cleanup

A daily Cloudflare Workers Cron Trigger deletes expired comment-system data as
defined in `comment_moderation_design.md`. It performs no content generation or
post-data writes.

`custom-worker.ts` reuses OpenNext's generated fetch handler and adds the
scheduled handler. Wrangler owns the `0 3 * * *` UTC trigger in
`wrangler.jsonc`; do not configure a second dashboard-only trigger. Deploying
the production Worker applies trigger changes, which may take several minutes
to propagate. The handler logs aggregate deletion counts only.

---
