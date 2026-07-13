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
│   │   └── blog/
│   │       ├── page.tsx
│   │       └── [year]/[post]/page.tsx
│   ├── components/
│   │   ├── post-list.tsx
│   │   ├── post-markdown.tsx
│   │   ├── search-archive.tsx
│   │   ├── site-footer.tsx
│   │   ├── site-header.tsx
│   │   └── theme-switcher.tsx
│   ├── lib/
│   │   ├── comments/
│   │   │   ├── hashing.ts
│   │   │   └── repository.ts
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
│   └── 0001_init.sql
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
├── vitest.d1.config.mts
│
└── docs/
```

`public/pagefind/` and `public/post-assets/` are generated and ignored. The
Pagefind loader is tracked because it is the stable browser entry point for the
generated search API.

## Post URL Structure

```text
/blog/2026/20260503-learning-typescript
```

Derived from directory name.

No slug field required.

---
