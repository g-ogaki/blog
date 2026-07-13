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
│   ├── lib/
│   │   └── content/
│   ├── styles/
│   └── test/
│
├── migrations/
│   └── 0001_init.sql
│
├── public/
│   └── pagefind/
│
├── scripts/
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
