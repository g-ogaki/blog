# directory_design.md

```text
/
├── .github/
│   └── workflows/
│
├── content/
│   └── posts/
│       ├── 2026/
│       │   ├── 20260503-learning-typescript/
│       │   │   └── index.md
│       │   └── 20260515-rust-notes/
│       │       └── index.md
│       └── 2027/
│
├── src/
│   ├── app/
│   │   ├── api/comments/route.ts
│   │   ├── api/comments/moderate/route.ts
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [year]/[post]/page.tsx
│   │   └── comments/moderate/page.tsx
│   ├── components/
│   │   ├── comment-section.tsx
│   │   ├── home-terminal.tsx
│   │   ├── moderation-confirmation.tsx
│   │   ├── post-list.tsx
│   │   ├── post-markdown.tsx
│   │   ├── search-archive.tsx
│   │   ├── site-footer.tsx
│   │   └── site-header.tsx
│   ├── generated/
│   │   └── published-posts.json
│   ├── lib/
│   │   ├── comments/
│   │   │   ├── api.ts
│   │   │   ├── cleanup.ts
│   │   │   ├── discord.ts
│   │   │   ├── hashing.ts
│   │   │   ├── moderation-api.ts
│   │   │   ├── repository.ts
│   │   │   ├── tokens.ts
│   │   │   └── turnstile.ts
│   │   ├── content/
│   │   │   ├── assets.ts
│   │   │   ├── link-preview.ts
│   │   │   ├── posts.ts
│   │   │   └── taxonomy.ts
│   │   ├── format-date.ts
│   │   ├── pagefind-client.ts
│   │   ├── search.ts
│   │   ├── site.ts
│   │   ├── static-metadata.ts
│   │   └── syndication.ts
│   ├── styles/
│   └── test/
│
├── migrations/
│   ├── 0001_init.sql
│   └── 0002_retention_indexes.sql
│
├── public/
│   ├── pagefind/
│   ├── pagefind-loader.js
│   └── post-assets/ (generated, ignored)
│
├── scripts/
│   ├── generate-static-metadata.ts
│   ├── publish-post-assets.ts
│   └── validate-content.ts
│
├── test/
│   └── d1/
│       ├── comment-repository.test.ts
│       └── setup.ts
│
├── custom-worker.ts
├── vitest.d1.config.mts
├── wrangler.jsonc
│
└── docs/
```

`public/pagefind/` and `public/post-assets/` are generated and ignored. The
Pagefind loader is tracked because it is the stable browser entry point for the
generated search API.

`src/generated/published-posts.json` is a tracked, build-generated manifest of
published slugs, titles, and URLs used by the dynamic comment API and Discord
notification. It keeps filesystem Markdown parsing out of the Worker request
bundle and is refreshed by `npm run generate:metadata`.

## Post URL Structure

```text
/blog/2026/20260503-learning-typescript
```

Derived from directory name.

No slug field required.

---
