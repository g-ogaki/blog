# deployment_design.md

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

---

## Environment Variables

```text
DISCORD_WEBHOOK_URL
TURNSTILE_SECRET_KEY
IP_HASH_SECRET
```

---

## Static Assets

Required global asset:

```text
public/og/default.png
```

Used when a post does not specify an image in frontmatter.

---