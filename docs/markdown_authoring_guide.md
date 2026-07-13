# Markdown authoring guide

## New Post

Create:

```text
content/posts/2026/20260503-learning-typescript/
```

Inside:

```text
index.md
```

The directory year and `YYYYMMDD` prefix must match the frontmatter date. Use
canonical `/blog/YYYY/YYYYMMDD-slug` URLs when linking between posts. Relative
images and files must remain inside the post directory and exist before a build
can succeed.

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

## Images

Optional:

```yaml
image: cover.png
```

When specified, this is used for Open Graph previews; otherwise the site-wide
default image is used. Other post images can be placed beside `index.md`.

Example:

```text
20260503-learning-typescript/
├── index.md
└── cover.png
```

---

## Mathematics and code

Inline:

```latex
$e^{i\pi}+1=0$
```

Block:

```latex
$$
\int_0^1 x^2dx
$$
```

---

## Code

````md
```ts
const x = 42;
```
````

To syntax-highlight inline code, append a Shiki language marker inside the
backticks:

```md
`const x = 42{:ts}`
```

Inline code without a marker remains normal inline code. Raw HTML is ignored;
write content using Markdown rather than embedded HTML.

---

## Link Cards

Standalone URL:

```md
https://nextjs.org
```

creates a link card.

The paragraph must contain only one absolute `https` URL. Metadata is fetched
during the static build; if the remote page is unavailable or has no usable
metadata, the URL is rendered as a normal link.

Inline URL:

```md
I used https://nextjs.org.
```

remains a normal hyperlink.

---
