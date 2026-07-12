# directory_design.md

```text
/
├── content/
│   └── posts/
│       ├── 2026/
│       │   ├── 20260503-learning-typescript/
│       │   │   ├── index.md
│       │   │   ├── diagram.png
│       │   │   └── matrix.svg
│       │   └── 20260515-rust-notes/
│       │       └── index.md
│       └── 2027/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
│
├── public/
│   └── pagefind/
│
├── scripts/
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