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
│   ├── components/
│   │   └── post-markdown.tsx
│   ├── lib/
│   │   └── content/
│   │       ├── assets.ts
│   │       └── posts.ts
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
