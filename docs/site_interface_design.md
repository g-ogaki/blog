# Site interface design

## Site shell

The root layout owns the shared header, footer, skip link, Japanese document
language, metadata defaults, and theme initialization. Primary navigation links
to the homepage and blog archive. The shell uses semantic landmarks and visible
keyboard focus styles.

## Homepage

The Japanese homepage introduces moni and the site's purpose in a profile panel
beside a short three-turn prepared interview, then presents the newest published
post as a featured item with four supporting recent posts. The profile uses the
existing selfie, presents no professional title, and keeps X and GitHub available
as labeled icon links. The latest-post section links to the complete blog archive.
Drafts are excluded through the canonical content loader.

Homepage main content uses a centered `max-w-6xl` measure inside the wider
`max-w-7xl` site shell. On wide screens, the profile and interview use a
one-third/two-thirds grid with a `3rem` gap; they stack at `48rem` and below.
The recent-post area uses equal-width columns so that its four supporting items
retain readable copy and `10rem` thumbnails beside the narrower featured post.

The interview is the homepage's single playful motion treatment and uses a
Claude Code-inspired terminal application rather than chat bubbles or a plain
shell transcript. Its shell identity separates the visitor account `guest`, the
fictional host `notebook`, the working directory `~/about`, and the launched
program `moni`. On ordinary motion preferences, the command in
`guest@notebook:~/about$ moni` is typed first. The macOS-style title changes from
`about — zsh` to `about — moni`, then the startup banner appears within space
already reserved for it. The title bar uses three noninteractive traffic-light
placeholders and one folder icon; these remain local to this terminal. The banner
contains a small neutral pixel-art cat, the program version, and the site domain
without a professional title. Each prepared question is subsequently typed into
the fixed input row,
submitted as a `>` prompt, and followed by a streamed `●` response. Terminal
chrome, banner metadata, prompts,
typed questions, and cursor use the system monospace stack; Japanese responses
retain the system sans-serif stack. The transcript scrolls internally and follows
the newest output with an immediate, non-smooth scroll, while the input remains
fixed. The terminal has no status footer. Its later high-fidelity treatment uses
a light neutral terminal in light mode and a dark neutral terminal in dark mode.
The pixel cat remains decorative and local to this banner; it is not a site mascot.
Reduced-motion and no-JavaScript visitors see the completed transcript
immediately, and assistive technology receives the complete conversation without
incremental live announcements.

## Blog archive

The archive lists published posts newest first and derives category, tag, year,
and month navigation from their frontmatter. Taxonomy values use the query URL
contract documented in `routing_design.md`. Pagefind performs keyword search
and client-side filtering while keeping that URL in sync. The unfiltered archive
remains usable while search loads, without JavaScript, and if its static assets
are unavailable.

## Dates

Visible post and comment dates use `YYYY.MM.DD` formatting with the
`Asia/Tokyo` timezone. The machine-readable `datetime` attribute retains the
source date or timestamp value.

## Themes

The supported preferences are light, dark, and system. System is the default.
An explicit selection is stored under the browser-local `theme` key and applied
to the root `data-theme` attribute. A small head script applies explicit stored
preferences before paint; system mode leaves the attribute unset and uses
`prefers-color-scheme`. Theme choice is the only site-shell behavior that
requires client-side JavaScript.

Both palettes follow the visual language and accessibility constraints in the
root [`DESIGN.md`](../DESIGN.md), including accessible focus styles, responsive
behavior, and reduced-motion handling. Post content and navigation remain
available when scripts fail.
