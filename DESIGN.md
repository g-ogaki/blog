---
version: alpha
name: Quiet Technical Journal
description: A modern, simple, warm, and quiet design system for moni's Japanese personal blog.
colors:
  primary: "oklch(48.8% 0.243 264.376)"
  primary-hover: "oklch(42.4% 0.199 265.638)"
  on-primary: "#ffffff"
  light-surface: "oklch(98.5% 0 0)"
  light-surface-raised: "#ffffff"
  light-surface-subtle: "oklch(96.7% 0.001 286.375)"
  light-text: "oklch(37% 0.013 285.805)"
  light-text-muted: "oklch(44.2% 0.017 285.786)"
  light-border: "oklch(87.1% 0.006 286.286)"
  light-control-border: "oklch(55.2% 0.016 285.938)"
  light-focus: "oklch(54.6% 0.245 262.881)"
  dark-primary: "oklch(70.7% 0.165 254.624)"
  dark-primary-hover: "oklch(80.9% 0.105 251.813)"
  dark-on-primary: "oklch(14.1% 0.005 285.823)"
  dark-surface: "oklch(21% 0.006 285.885)"
  dark-surface-raised: "oklch(27.4% 0.006 286.033)"
  dark-surface-subtle: "oklch(37% 0.013 285.805)"
  dark-text: "oklch(87.1% 0.006 286.286)"
  dark-text-muted: "oklch(70.5% 0.015 286.067)"
  dark-border: "oklch(37% 0.013 285.805)"
  dark-control-border: "oklch(55.2% 0.016 285.938)"
  dark-focus: "oklch(70.7% 0.165 254.624)"
typography:
  page-title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.111
    letterSpacing: -0.02em
  section-title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: -0.01em
  subsection-title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
  article-body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 2
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.429
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.429
  metadata:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.333
rounded:
  none: 0px
  sm: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  full: 9999px
spacing:
  unit: 0.25rem
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  3xl: 4rem
  article-max: 48rem
  shell-max: 80rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  flow-content-gap: 2.25rem
  detached-content-gap: 3rem
  heading-content-gap: 1.5rem
  subsection-gap: 3rem
  section-gap: 4rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 0.75rem
    height: 2.75rem
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 0.75rem
    height: 2.75rem
  button-primary-dark-hover:
    backgroundColor: "{colors.dark-primary-hover}"
    textColor: "{colors.dark-on-primary}"
  button-secondary:
    backgroundColor: "{colors.light-surface-subtle}"
    textColor: "{colors.light-text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 0.75rem
    height: 2.75rem
  button-secondary-dark:
    backgroundColor: "{colors.dark-surface-subtle}"
    textColor: "{colors.dark-text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 0.75rem
    height: 2.75rem
  input:
    backgroundColor: "{colors.light-surface-raised}"
    textColor: "{colors.light-text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 0.75rem
    height: 2.75rem
  input-dark:
    backgroundColor: "{colors.dark-surface-raised}"
    textColor: "{colors.dark-text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 0.75rem
    height: 2.75rem
  tag:
    backgroundColor: "{colors.light-surface-subtle}"
    textColor: "{colors.light-text-muted}"
    typography: "{typography.body-small}"
    rounded: "{rounded.full}"
    padding: 0.5rem
  tag-dark:
    backgroundColor: "{colors.dark-surface-raised}"
    textColor: "{colors.dark-text-muted}"
    typography: "{typography.body-small}"
    rounded: "{rounded.full}"
    padding: 0.5rem
---

# Quiet Technical Journal

## Overview

The site should feel like a contemporary independent technical journal: modern and precise, but written by a person rather than a product team. It is a calm place for Japanese long-form writing about software, mathematics, investing, personal growth, and daily life. The interface supports the reading instead of competing with it.

The character is **simple, warm, approachable, and quiet**. Quiet does not mean faint or low-contrast. It comes from modest typography, a disciplined grid, limited color, generous whitespace, and the absence of decorative spectacle. Pages should feel considered without looking designed for attention.

Tailwind CSS defaults are the baseline. Use its standard spacing, type-size, breakpoint, radius, shadow, and transition scales whenever they satisfy the need. Introduce a new value only when the content has a concrete requirement that the default scale cannot express.

## Colors

The palette uses Tailwind's Zinc neutrals with Blue as its only interactive accent. Semantic application tokens should map to these values so that components describe roles such as surface, text, border, and action rather than naming raw colors.

- **Light surfaces** use Zinc 50 for the page, white for a genuinely raised or editable surface, and Zinc 100 for subtle grouping. Pure white should not become a field of unnecessary cards.
- **Dark surfaces** use Zinc 900 for the page, Zinc 800 for raised surfaces, and Zinc 700 for subtle grouping. This produces a softer dark canvas without approaching absolute black.
- **Primary text** uses Zinc 700 in light mode and Zinc 300 in dark mode. Both article pairings are intentionally milder than near-black on near-white or near-white on near-black while remaining comfortably within WCAG AAA.
- **Muted text** uses Zinc 600 in light mode and Zinc 400 in dark mode. Muted text is still readable text, never a decorative gray.
- **Blue** is reserved for links, focus, selected controls, and meaningful actions. Use Blue 700 in light mode and Blue 400 in dark mode so interactive text remains distinguishable on its surface.
- **Borders** use Zinc 300 in light mode and Zinc 700 in dark mode. Borders organize information quietly; they are not decoration.

All normal text must meet WCAG 2.2 AA contrast of at least 4.5:1, and large text at least 3:1. Aim for 7:1 for article text. Controls, focus indicators, and meaningful graphical boundaries must reach 3:1 against adjacent colors. Never use color as the only indication of state.

## Typography

Use the system sans-serif stack for headings and prose. It uses the reader's native UI fonts, including the operating system's Japanese font, avoids an external font request, and keeps the site contemporary without imposing a decorative voice. Use the system monospace stack only for code and genuinely technical metadata.

The hierarchy is intentionally modest. A heading's purpose is navigation, not promotion.

- **Page titles** use the Tailwind `text-4xl` size at most on wide screens. Use a smaller size on narrow screens. They should never approach poster or landing-page scale.
- **Section titles** use `text-2xl`; subsections use `text-xl`. Prefer weight 600 and spacing above the heading over a larger size.
- **Article prose** uses `text-lg` with a relaxed line height where space permits. Interface copy remains `text-base` or `text-sm`.
- **Labels** use medium weight without forced uppercase or exaggerated letter spacing. Japanese labels must not be treated as Latin display typography.
- Use no more than three weights in ordinary pages: 400, 500, and 600. Reserve 700 for rare cases where semantics require unusually strong emphasis.

Keep text selectable and allow browser zoom and user font settings. Avoid justified text. Body copy is left-aligned and uses natural wrapping; do not manually insert line breaks to control its silhouette.

## Layout

The layout is a restrained, mobile-first editorial column. The article is the primary object, not a collection of dashboard cards.

- Limit reading content to approximately 65–70 characters per line, represented by the Tailwind `max-w-3xl` default. Code blocks, tables, archives, and the site shell may use wider containers up to `max-w-7xl` when their content needs it.
- Use the Tailwind spacing scale and its 4px base unit. Keep component interiors, metadata, tags, forms, and closely related controls compact with `2` through `6`; component padding commonly uses `3` or `4`.
- Long-form content distinguishes the written flow from detached supporting material. Paragraphs, quotations, lists, and mathematics use `9` ({spacing.flow-content-gap}). Code blocks, images, and link cards sit outside the sentence flow and use `12` ({spacing.detached-content-gap}) on both sides. Headings sit `6` ({spacing.heading-content-gap}) from their first content block; subsections begin after `12` ({spacing.subsection-gap}); and major article or page sections begin after `16` ({spacing.section-gap}).
- Express vertical rhythm as the space between adjacent elements, normally with one-direction block-start spacing. Do not assign large top and bottom margins to every element, because margin collapsing and combined margins make the rhythm unpredictable.
- Use `px-4` page gutters on small screens and `px-6` from the appropriate responsive breakpoint. Do not shrink the reading column to create decorative empty rails.
- Separate sections primarily with whitespace. A thin rule may clarify a list or boundary, but every section does not need a box.
- The homepage begins with a concise introduction, not a full-viewport hero. Its heading follows the same quiet scale as other page titles.
- Archive and search controls may use a wider layout, but their reading order and useful static fallback remain obvious at every breakpoint.

## Elevation & Depth

This is a mostly flat system. Hierarchy comes from spacing, typography, borders, and small tonal differences.

Use a raised white or Zinc 900 surface only when an element genuinely sits above its context, such as a menu or editable field. Use Tailwind's smallest shadows sparingly for overlays where a border alone does not separate layers. Ordinary post lists, article sections, link cards, and comment blocks should not float.

Hover feedback changes color or border tone without translating, scaling, or lifting the element. Avoid gradients, glass effects, backdrop blur, glows, and ambient shadows.

## Shapes

The default shape is Tailwind `rounded-md` (`0.375rem`): enough softness to feel approachable without making the interface playful or pillowy. Small inline surfaces may use `rounded-sm`; larger media containers may use `rounded-lg` when clipping content requires it.

Use `rounded-full` only for tags, compact segmented controls, avatars if they are ever introduced, and other elements whose semantics suit a pill or circle. Do not turn every button, field, card, and navigation item into a pill. Article sections and list rows normally need no enclosing radius at all.

## Components

### Site shell

Use the text wordmark **moni's page** without a mascot, emblem, or ornamental logo mark. The header is compact and clearly separates branding, primary navigation, search, language choice, and theme choice. After the wordmark, its control order is Home, Blog, Search, Language, then Theme. A subtle border is preferred to a shadow or translucent blur. At `36rem` and below, use a two-row grid: wordmark and primary navigation on the first row, then the flexible search field and language/theme controls on the second. Keep every control visible, preserve DOM and keyboard order, and do not introduce a hamburger menu for this small navigation set.

Use neutral navigation treatments in the site shell. The current primary-navigation item uses a quiet Zinc tonal background, `rounded-md`, neutral text, and semantic `aria-current`; do not mark it with a persistent Blue underline. In breadcrumbs, linked ancestors use neutral medium-weight text without a persistent underline, while the current-page label remains plain muted text. A subtle tonal hover or focus background provides additional affordance without making navigation look promotional.

Footer navigation uses the same neutral link treatment as breadcrumbs: medium-weight neutral text, no persistent underline, and a subtle tonal hover or focus background. Keep the footer compact and center-aligned, with X (Twitter), GitHub, and Feed on the first row and the concise copyright `© YYYY moni` beneath it.

The header search is a compact, persistently visible search field that submits to the static Pagefind archive URL contract. Give it an accessible label in addition to its placeholder, a neutral control border, and a search icon that does not replace text semantics. The language control uses a compact globe-icon trigger and a labeled menu with explicit language names; communicate the current and unavailable states in text and accessibility attributes. Icon-only triggers retain a minimum `44px` target and an accessible name.

The theme control uses one compact sun-or-moon icon button that opens a labeled menu for light, dark, and system preferences. The icon reflects the effective light or dark appearance; the menu exposes all three choices as text. Its selected state uses fill, weight, and an explicit text cue—not color alone. The trigger and menu follow standard keyboard behavior, close on Escape or outside interaction, and return focus predictably.

### Dates and metadata

Visible dates use the quiet numeric `YYYY.MM.DD` format throughout articles and comments. Preserve the source date or timestamp in the semantic `datetime` attribute, and interpret timestamps in `Asia/Tokyo` before formatting. Do not show the author on article pages because the site has one obvious author.

### Links and buttons

Text links are visibly recognizable without relying only on a hover state. Within prose, use an underline with a readable offset. Navigation links may use weight and current-state treatment instead, provided their affordance remains clear.

Buttons use a minimum practical height of `2.75rem` (`44px`) and `rounded-md`. Primary buttons use the blue action color; secondary buttons use a neutral tonal surface. Most blog navigation should remain a link rather than being styled as a call-to-action button. Hover and active states change color over Tailwind's `duration-150`; they do not move.

### Post lists, tags, and cards

Post lists are typographic lists with clear titles, summaries, dates, and taxonomy. Use whitespace or a thin divider between items rather than placing every post in a raised card. Titles should be only one step larger than their summaries.

Tags and active filters may use compact pills. Keep them subordinate to titles and content. Link cards use a border and a subtle surface difference, preserve a clear reading order on mobile, and avoid promotional styling.

### Articles, code, and mathematics

Article prose owns the narrow reading measure. Content within the written flow uses {spacing.flow-content-gap}; detached supporting material uses {spacing.detached-content-gap}; heading-to-first-content spacing uses {spacing.heading-content-gap}; subsections use {spacing.subsection-gap}; and major sections use {spacing.section-gap}. Apply these as one-direction gaps between elements rather than paired top and bottom margins. This keeps headings attached to their first content and separates code, images, and link cards without fragmenting prose, quotations, lists, or mathematics.

Treat mathematics as part of the article's language, not as a separate interface component. Display equations may be centered and may scroll horizontally when necessary, but do not add a background, border, radius, shadow, or card-like padding solely because the content is mathematical. Code blocks may scroll horizontally rather than compressing or wrapping code unexpectedly. Syntax color must remain legible in both themes and must not make plain text look disabled.

### Forms and comments

Inputs use a persistent neutral border, a visible label, and a clear Blue focus ring. Control boundaries use Zinc 500 in both themes ({colors.light-control-border} and {colors.dark-control-border}); this is quieter than using the text color while retaining at least 3:1 contrast against editable surfaces. Placeholder text is supplementary and never replaces a label. Validation messages explain the problem in text and associate it with the relevant control. Comment content remains visually part of the article flow rather than resembling a social-media feed.

### Focus, targets, and motion

Every keyboard-operable element has a visible focus indicator with at least a 2px ring and separation from the element where needed. Aim for `44px` targets; where inline links cannot meet that size, ensure adequate spacing and avoid tightly packed competing targets.

Use motion only to clarify direct feedback. Color and border transitions use Tailwind `duration-150` with a standard easing. Do not animate page entry, scrolling, layout, or reading content. Under `prefers-reduced-motion: reduce`, remove nonessential transitions and disable smooth scrolling.

## Do's and Don'ts

- **Do** make long Japanese articles, code, and mathematics comfortable to read before adding visual personality.
- **Do** use Tailwind defaults before creating a project-specific spacing, radius, type-size, shadow, breakpoint, or duration.
- **Do** preserve semantic HTML, logical heading order, keyboard navigation, visible focus, and useful interfaces without client-side JavaScript where the architecture requires it.
- **Do** verify contrast in both themes and in hover, focus, selected, disabled, success, and error states.
- **Do** create hierarchy with spacing and weight before increasing font size.
- **Do** keep the light-mode page background neutral and near-white: use Zinc 50, with white reserved for genuinely raised or editable surfaces.
- **Don't** use an oversized hero, display headline, decorative orbit, or full-viewport introductory composition.
- **Don't** add mascots, emoji as interface decoration, ornamental marks, gradients, glassmorphism, glows, background grids, or decorative motion.
- **Don't** turn ordinary sections, post rows, or comments into floating cards.
- **Don't** use uppercase, wide tracking, or monospace merely to make metadata look technical.
- **Don't** use Blue as decoration; its scarcity communicates interactivity and state.
- **Don't** use low contrast to manufacture quietness. Quietness comes from restraint, not faintness.
- **Don't** add external web fonts unless a later, explicit brand decision changes this system.
