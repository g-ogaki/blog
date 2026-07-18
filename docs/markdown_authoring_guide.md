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

## Headings and table of contents

Use level-two headings for article sections and level-three headings for their
subsections:

```md
## 日本語の見出し

### 小見出し
```

These headings automatically appear in the entry's 「目次」 navigation. Level
three headings nest beneath the preceding level-two heading. The page title is
the only level-one heading, and level-four or deeper headings are not included
in the table of contents.

Heading text also becomes its fragment ID. Japanese text is preserved, Latin
text is lowercased, spaces become hyphens, and punctuation is removed. For
example, `[見出しへ](#日本語の見出し)` links to the heading above. Repeated
headings receive `-1`, `-2`, and later suffixes in document order. Prefer unique,
descriptive headings so authored fragment links remain clear.

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

The fenced block displays its language above the code. Shiki-supported language
identifiers and aliases may be used without registering them in application
code. For example, both `ts` and `typescript` load the TypeScript grammar and
display as `typescript`; `py`, `cpp`, `json`, `html`, and `css` work the same
way. A fence without a language has no label. An unknown or misspelled language
fails content validation and reports its source line.

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
