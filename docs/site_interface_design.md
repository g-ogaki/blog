# Site interface design

## Site shell

The root layout owns the shared header, footer, skip link, Japanese document
language, metadata defaults, and theme initialization. Primary navigation links
to the homepage and blog archive. The shell uses semantic landmarks and visible
keyboard focus styles.

## Homepage

The Japanese homepage introduces moni and the site's purpose, then lists at
most the latest five published posts. Drafts are excluded through the canonical
content loader. The latest-post section links to the complete blog archive.

## Blog archive

The archive lists published posts newest first and derives category, tag, year,
and month navigation from their frontmatter. Taxonomy values use the query URL
contract documented in `routing_design.md`. Pagefind performs keyword search
and client-side filtering while keeping that URL in sync. The unfiltered archive
remains usable while search loads, without JavaScript, and if its static assets
are unavailable.

## Dates

Visible post dates use Japanese formatting with the `Asia/Tokyo` timezone. The
machine-readable `datetime` attribute retains the source `YYYY-MM-DD` value.

## Themes

The supported preferences are light, dark, and system. System is the default.
An explicit selection is stored under the browser-local `theme` key and applied
to the root `data-theme` attribute. A small head script applies explicit stored
preferences before paint; system mode leaves the attribute unset and uses
`prefers-color-scheme`. Theme choice is the only site-shell behavior that
requires client-side JavaScript.

Both palettes share the same warm editorial visual language, accessible focus
styles, responsive breakpoints, and reduced-motion handling. Post content and
navigation remain available when scripts fail.
