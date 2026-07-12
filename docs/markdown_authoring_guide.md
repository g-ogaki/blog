# markdown_authoring_guide.md

## New Post

Create:

```text
content/posts/2026/20260503-learning-typescript/
```

Inside:

```text
index.md
```

---

## Frontmatter

```yaml
---
title: Learning TypeScript
date: 2026-05-03
category: Programming
tags:
  - typescript
  - learning
summary: Notes from learning TypeScript.
draft: false
image: cover.png
---
```

---

## OGP Images

Optional:

```yaml
image: cover.png
```

When specified, the image is used for Open Graph previews.

If omitted, the site-wide default image is used.

Example:

```text
20260503-learning-typescript/
├── index.md
└── cover.png
```

---

## Mathematics

Inline:

```latex
$e^{i\pi}+1=0$
```

Block:

```latex
\[
\int_0^1 x^2dx
\]
```

---

## Code

````md
```ts
const x = 42;
```
````

---

## Link Cards

Standalone URL:

```md
https://nextjs.org
```

creates a link card.

Inline URL:

```md
I used https://nextjs.org.
```

remains a normal hyperlink.

---