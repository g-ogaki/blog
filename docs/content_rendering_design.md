# content_rendering_design.md

## Rendering Pipeline

```text
Markdown
↓
Parse
↓
Math Rendering
↓
Code Highlighting
↓
Link Preview Extraction
↓
HTML
```

---

## Mathematics

Libraries:

* remark-math
* rehype-katex

Supports:

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

## Code Highlighting

Library:

* Shiki

Supports:

* Inline code
* Code blocks

---

## Images

Images are colocated with posts.

Example:

```text
20260503-learning-typescript/
├── index.md
└── diagram.png
```

---

## Link Cards

### Rule

Standalone URL paragraph:

```md
https://nextjs.org
```

renders as:

```text
Link Card
```

Inline links remain normal hyperlinks.

---

## Metadata Extraction

Build-time only.

Sources:

* Open Graph
* Twitter Card metadata

Supported:

* YouTube
* X
* GitHub
* Generic Open Graph pages

Fallback:

* Normal hyperlink

---

## Open Graph Metadata

Every page generates:

- title
- description
- canonical URL
- Open Graph metadata

### OGP Image Selection

Priority:

1. frontmatter image
2. site-wide default image

Example:

```yaml
image: cover.png
```

Directory:

```text
20260503-learning-typescript/
├── index.md
└── cover.png
```

Generated:

```html
<meta property="og:image" content="https://monipy.org/.../cover.png">
```

If no image field exists:

```html
<meta property="og:image" content="https://monipy.org/og/default.png">
```