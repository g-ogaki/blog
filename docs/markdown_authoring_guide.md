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

`index.md` is the required Japanese article. To add an English translation,
create `index.en.md` in the same directory. It contains complete frontmatter,
may remain a draft independently, shares colocated assets, and publishes at the
same slug under `/en/blog/`. Use the exact localized URL when authoring an
internal link.

Every English article is currently treated as an AI translation. Its published
page automatically displays a disclosure linking to the original Japanese
article; authors must not duplicate that notice in Markdown. Introduce an
explicit translation-method field before publishing human translations without
the disclosure.

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
draft: false
image: cover.png
---
```

Do not add a `summary` or `description` field. The build derives a description
from the opening ordinary paragraphs, removes Markdown presentation syntax, and
reuses the result for metadata, RSS, search, and internal link cards. It is
limited to 120 user-perceived characters; articles without suitable paragraph
text fall back to `「<title>」についての記事です。`.

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
Images keep their original aspect ratio, including tall images.

Standalone Markdown images can be opened at their full size. With JavaScript,
the original file appears in a dialog that closes with its button, the backdrop,
or Escape. Without JavaScript, the image remains a normal link to the original
file. Inline images and images already wrapped in a Markdown link are left
unchanged.

---

## Headings and table of contents

Use level-two headings for article sections and level-three headings for their
subsections:

```md
## 日本語の見出し

### 小見出し
```

Level-two through level-four headings automatically appear in the entry's
「目次」 navigation and nest beneath the nearest preceding shallower heading.
The page title is the only level-one heading, and level-five or deeper headings
are not included in the table of contents.

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

Append a filename after the language with a colon when the block represents a
specific file:

````md
```python:main.py
print("hello")
```
````

The renderer uses `python` for highlighting and displays `main.py` in the code
header. Filenames must be nonempty and cannot contain whitespace.

To syntax-highlight inline code, append a Shiki language marker inside the
backticks:

```md
`const x = 42{:ts}`
```

Inline code without a marker remains normal inline code. HTML written inside
inline or fenced code is displayed literally rather than interpreted.

---

## HTML in articles

Standard HTML may be mixed with Markdown when Markdown has no equivalent. The
supported semantic elements are `a`, `abbr`, `audio`, `b`, `blockquote`, `br`,
`cite`, `code`, `dd`, `del`, `details`, `div`, `dl`, `dt`, `em`, `figcaption`,
`figure`, `font`, `h2` through `h6`, `hr`, `i`, `iframe`, `img`, `ins`, `kbd`, `li`,
`mark`, `ol`, `p`, `pre`, `q`, `s`, `samp`, `small`, `source`, `span`, `strong`,
`sub`, `summary`, `sup`, table elements, `time`, `track`, `u`, `ul`, `var`, and
`video`. Each element also has an explicit attribute allowlist. Unsupported
markup fails content validation; arbitrary classes, inline styles, IDs, event
handlers, scripts, forms, and unrestricted embeds are not accepted.

Legacy color markup is accepted only in this constrained form:

```html
<font color="#c00">Important text</font>
```

The color may be a CSS color name or hexadecimal value. `face`, `size`,
`style`, and event attributes are rejected.

To add a source to a quotation, end the blockquote with a separate paragraph
beginning with an em dash:

```md
> Quoted text.
>
> — Source
```

The source is rendered outside the quotation border as a right-aligned caption,
using the same layout as an image caption. The leading em dash is an authoring
marker and is not displayed.

Long unbreakable mathematics inside a quotation scrolls horizontally rather
than widening or clipping the article.

Use blank lines around block HTML whose contents include Markdown:

```md
<details>
<summary>Click here to expand</summary>

### Hidden heading

- First item
- Second item

</details>
```

`summary` must be the first element and must contain text. Headings inside a
disclosure do not appear in the page-level table of contents.

Audio and video sources must use absolute HTTPS URLs. Controls and metadata
preloading are applied automatically, and autoplay is rejected:

```html
<video src="https://media.example.com/movie.mp4"
       poster="https://media.example.com/poster.jpg"></video>
```

YouTube is the only supported iframe provider. Use its `/embed/` URL and provide
a meaningful title; the renderer converts the source to privacy-enhanced mode
and applies the security and loading attributes:

```html
<iframe src="https://www.youtube.com/embed/M7lc1UVf-VE"
        title="YouTube video"></iframe>
```

---

## Link Cards

Standalone URL:

```md
https://nextjs.org
```

creates a link card.

The paragraph must contain only one absolute `https` URL. After adding or
changing one, refresh its generated metadata before committing:

```sh
npm run refresh:link-previews
```

The tracked manifest keeps production builds independent of third-party
availability. Published content validation fails when a standalone URL has no
generated preview, while a failed refresh retains previously generated
metadata.

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
