# Site interface design

## Site shell

The locale root layouts own the shared header, footer, skip link, document
language, localized metadata defaults, and theme initialization. Primary navigation links
to the current locale's homepage and blog archive. Japanese keeps the unprefixed
routes; English uses `/en`. The shell uses semantic landmarks and visible
keyboard focus styles. Search-bearing headers reflow into two rows at `48rem`
and below, keeping the wordmark and navigation above search and the language/theme
controls. The archive header omits search and may defer its compact arrangement
until `36rem`; that smaller breakpoint also owns narrow gutters and viewport-bound
menus. The homepage and blog-entry page share the same search-bearing header
geometry and control treatments; only their semantic current-navigation item
changes. Primary-navigation labels do not wrap internally.

The language menu contains explicit Japanese and English links. Selecting a
language stores the `site_locale` preference and navigates to the same article
when that translation exists. When English is unavailable, it returns to the
current Japanese article and renders an English availability notice after
hydration. The notice has a dismiss button but no archive or replacement link.
The menu therefore remains functional without client-side JavaScript.
On `/` only, the Worker uses the saved preference and then `Accept-Language` to
redirect English-preferring visitors to `/en`. An explicit localized URL is
never replaced automatically. After hydration, visitors whose browser language
differs from the current page receive a dismissible suggestion using the same
published counterpart when available. Suggestion text uses the preferred
reader language: English when suggesting English and Japanese when suggesting
Japanese.

The centered footer places X (Twitter), GitHub, and Feed above the muted legal
line `© YYYY moni · Licensed under CC0 1.0 Universal`. Only the license name links
to `https://creativecommons.org/publicdomain/zero/1.0/deed.en`; the line remains
regular-weight and may wrap naturally on narrow screens. X and GitHub open in a
new tab; Feed stays in the current tab.

## Homepage

Each localized homepage introduces moni and the site's purpose in a profile panel
beside a short three-turn prepared interview, then presents the newest published
post in that language as a featured item with up to four supporting recent posts. The profile uses the
existing selfie as a circular `12rem` portrait, presents no professional title,
and keeps X and GitHub available as labeled icon links. Its purpose copy is
separated by whitespace rather than a divider. The latest-post section links to
the complete blog archive. Drafts are excluded through the canonical content loader.

Homepage main content uses a centered `max-w-6xl` measure inside the wider
`max-w-7xl` site shell. On wide screens, the profile and interview use a
one-third/two-thirds grid with a `3rem` gap; they stack at `48rem` and below.
The portrait, name, and social links remain centered at every width while the
purpose sentence remains left-aligned.
The recent-post area uses equal-width columns so that its four supporting items
retain readable copy and `10rem` thumbnails beside the narrower featured post.

The interview is the homepage's single playful motion treatment and uses a
Claude Code-inspired terminal application rather than chat bubbles or a plain
shell transcript. Its shell identity separates the visitor account `guest`, the
fictional host `notebook`, the working directory `~/about`, and the launched
program `moni`. On ordinary motion preferences, the command in
`guest@notebook:~/about$ moni` is typed first. The hydrated terminal initially
shows the empty zsh prompt and a blinking cursor for 1000ms before typing the
command. The macOS-style title changes from `about — zsh` to `about — moni`, then
the startup banner appears within space already reserved for it. The banner
settles for 420ms before the first prepared guest question is typed at 42ms per
character. After each completed moni response, the sequence waits 630ms before
typing the next question; the same final pause occurs before free input is
enabled. The title bar uses three noninteractive red, amber, and green
traffic-light circles in macOS order plus one folder icon; these remain
decorative and local to this terminal. The banner
contains a small seated-cat SVG with a Tailwind Yellow 600 body and Yellow 700
outline/details, the program version, and the site domain without a professional
title. Each prepared question is subsequently typed into the fixed input row,
held there for 300ms after its final character, and then submitted as a `>`
prompt. The question remains on its own for another 300ms before a processing
state appears for at least 600ms. That state keeps the `●` response marker intact
and cycles its label every 400ms through `Processing`, `Processing.`,
`Processing..`, and `Processing...`. No response row is rendered during the
question-only pause. Once processing begins, the response row starts at its natural
single-line height and grows only when the visible streamed text wraps; no hidden
copy of the completed answer reserves future lines. Transcript rows use a uniform
Tailwind `gap-3` rhythm: the space from guest text to its AI response and from that
response to the next guest text is `0.75rem` in both cases. Window chrome,
banner metadata, prompts, typed questions, responses, and the launch-command
cursor use the system monospace stack. The transcript scrolls internally and
follows the newest output with an immediate, non-smooth scroll, while the input
remains fixed. After the prepared sequence, that row becomes a real single-line form
control. It accepts repeated nonempty submissions of up to 200 characters and
sends them to the same-origin AI site-guide API. The assistant presents itself
as an AI navigator rather than moni, prioritizes indexed site knowledge, and
matches the latest question's language. It may add clearly distinguished
general knowledge, but answers remain at most two short sentences and 600
characters. Up to three deduplicated source links from the exact
`https://monipy.org` origin appear as a numbered list below the answer.
Free-text responses use the same question-only pause and processing state before
the application stream is shown. Early provider tokens are buffered until the
processing state has been visible for at least 600ms. The control is disabled
while the prepared sequence or a response is playing;
visitor submissions are appended with DOM text rather than interpreted as markup. The
terminal has no status footer. Its high-fidelity treatment uses the same dark
neutral-grey surface in both site themes. Primary reading text uses a soft green,
secondary chrome and metadata use a muted green, and the brighter green is
reserved for prompts, output markers, focus, and active terminal feedback. This
palette is local to the terminal and does not replace the site's Blue interaction
color elsewhere. Use `oklch(30% 0 0)` for the main surface, `oklch(32% 0 0)`
for title-bar chrome, and `oklch(59% 0 0)` for meaningful terminal boundaries
so that the panel remains dark and monochrome without reading as pure black
against the light site surface.
The illustrated cat remains decorative and local to this banner; it is not a site mascot.
Reduced-motion visitors see the completed transcript, receive an enabled input
immediately, and see the same animated `● Processing` dot sequence while waiting
for a free-form response. Provider deltas replace it immediately without the
pending or minimum processing delays or decorative typing animation. The complete
visible free-form transcript remains in React state until reload, while only the
latest three completed exchanges are sent as model context. Rate-limit and
provider failures appear as localized terminal responses and re-enable the input.
No-JavaScript visitors
see the completed prepared transcript and an explicitly disabled input. Assistive
technology receives the complete prepared conversation without incremental live
announcements; completed visitor responses use a polite live status.

## Blog archive

Each archive lists only that locale's published posts newest first and derives
category, tag, year, and month navigation from their frontmatter. Taxonomy values use the query URL
contract documented in `routing_design.md`. Pagefind performs keyword search
and client-side filtering while keeping that URL in sync. The unfiltered archive
remains usable while search loads, without JavaScript, and if its static assets
are unavailable. Once JavaScript is active, the archive displays matching posts
in batches of ten and offers a localized load-more action while more remain. Changing the
query or taxonomy selection resets the visible batch. Later rows remain in the
server HTML and are hidden before first paint only when the root initializer
confirms JavaScript is available, avoiding both layout shift and a reduced
no-JavaScript archive. Categories remain
single-select, while tags can be toggled independently and narrow results to
articles containing every selected tag. Without JavaScript, all published posts
remain present and visible in the static archive. The count and load control are
removed without a completion message after the final batch appears.

The homepage, archive, and article layouts use Tailwind utilities directly and
prefer its default spacing, typography, radius, sizing, transition, and
responsive scales. The high-fidelity wireframes remain visual references rather
than a source of parallel component CSS. Custom values are limited to semantic
theme colors, content-dependent grid geometry, generated Markdown relationships,
and the terminal's documented drawing and animation. Styles that depend on
browser defaults are declared explicitly so Tailwind Preflight cannot silently
remove required list presentation or media geometry.

## Blog entries

Every English entry displays a subdued notice immediately after its metadata
and before the table of contents or article body: “This English version was
translated from the original Japanese using AI and may contain inaccuracies.”
“Original Japanese article” links to the corresponding unprefixed post. The
notice is labeled for assistive technology and excluded from Pagefind indexing.
Japanese entries, archives, feeds, and metadata do not display the disclosure.

When an entry contains level-two or level-three Markdown headings, an
always-expanded table of contents appears between its metadata and prose inside
the `max-w-3xl` reading column. It uses the visible heading 「目次」, subtle
horizontal borders, neutral unnumbered links, and default Tailwind spacing.
Level-three links are indented beneath their level-two parent. The same inline
treatment is retained at narrow and wide viewports; it does not become a card,
collapsible control, sticky rail, or scroll-tracking client interface.

## Dates

Visible post and comment dates use `YYYY.MM.DD` in Japanese and a localized
English date format in English, both with the `Asia/Tokyo` timezone. The
machine-readable `datetime` attribute retains the source date or timestamp value.

## Themes

The supported preferences are light, dark, and system. System is the default.
An explicit selection is stored under the browser-local `theme` key and applied
to the root `data-theme` attribute. A small head script applies explicit stored
preferences before paint; system mode leaves the attribute unset and uses
`prefers-color-scheme`. Theme choice and the optional browser-language mismatch
suggestion are the only site-shell enhancements that require client-side
JavaScript; language navigation itself uses ordinary links.

Both palettes follow the visual language and accessibility constraints in the
root [`DESIGN.md`](../DESIGN.md), including accessible focus styles, responsive
behavior, and reduced-motion handling. Post content and navigation remain
available when scripts fail.
