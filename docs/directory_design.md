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
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [year]/[post]/page.tsx
│   │   ├── rss.xml/route.ts
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── cloudflare-web-analytics.tsx
│   │   ├── post-list.tsx
│   │   ├── post-markdown.tsx
│   │   ├── site-footer.tsx
│   │   ├── site-header.tsx
│   │   └── theme-switcher.tsx
│   ├── lib/
│   │   ├── content/
│   │   │   ├── assets.ts
│   │   │   ├── link-preview.ts
│   │   │   ├── posts.ts
│   │   │   └── taxonomy.ts
│   │   ├── format-date.ts
│   │   ├── site.ts
│   │   └── syndication.ts
│   ├── styles/
│   └── test/
│
├── migrations/
│   └── 0001_init.sql
│
├── public/
│   ├── pagefind/
│   └── post-assets/ (generated, ignored)
│
├── scripts/
│   ├── publish-post-assets.ts
│   └── validate-content.ts
│
└── docs/
```

## Post URL Structure

```text
/blog/2026/20260503-learning-typescript
```

Derived from directory name.

No slug field required.

---
