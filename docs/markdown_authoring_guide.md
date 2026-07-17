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

To add a visible caption to an article image, provide a Markdown image title:

```md
![猫のサンプル画像](cat.png "記事に同梱したサンプル画像")
```

When the titled image is the only content in its paragraph, the title is
rendered as a visible caption. Images without a title do not render a caption.

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

The fenced block displays its language above the code. Both `ts` and
`typescript` are displayed as `typescript`; a fence without a language has no
label.

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

Standalone internal post card:

```md
[TypeScriptの記事](/blog/2026/20260503-learning-typescript)
```

The target post metadata is used directly without an HTTP request. Place the
same Markdown link inside a sentence when a normal inline link is preferred.

---
