# Documentation map

Read these documents in this order before changing the project:

1. `requirements_definition.md` — product scope and acceptance criteria.
2. `architecture_decisions.md` — decisions that require explicit approval to change.
3. `technology_stack.md` and `directory_design.md` — implementation boundaries.
4. The relevant design document: content, search, comments, API, database, or deployment.

## Source of truth

| Topic | Canonical document |
| --- | --- |
| Product features and post frontmatter | `requirements_definition.md` |
| Architecture decisions and invariants | `architecture_decisions.md` |
| Post-writing instructions | `markdown_authoring_guide.md` |
| Content discovery and validation | `content_loading_design.md` |
| Rendering and link-card behavior | `content_rendering_design.md` |
| Public routes and page metadata | `routing_design.md` |
| Site shell, responsive layout, and themes | `site_interface_design.md` |
| Visual identity and design tokens | [`../DESIGN.md`](../DESIGN.md) |
| Search | `search_design.md` |
| Comment lifecycle and abuse controls | `comment_moderation_design.md` |
| HTTP contract | `api_design.md` |
| D1 schema | `database_schema.md` |
| Delivery and secrets | `deployment_design.md` |

Other documents should link to the canonical document instead of duplicating its rules.

## Exploratory design artifacts

- [`wireframes/blog-entry.html`](wireframes/blog-entry.html) — standalone
  low-fidelity layout study for the blog entry page. `DESIGN.md` remains the
  canonical visual source of truth.
- [`wireframes/blog-entry-hi-fi.html`](wireframes/blog-entry-hi-fi.html) —
  standalone high-fidelity application of the approved blog entry layout and
  visual design system.
- [`wireframes/blog-list.html`](wireframes/blog-list.html) — standalone
  low-fidelity layout study for the responsive blog archive, context-aware
  search and taxonomy filters, thumbnail-supported post rows, and planned
  incremental loading control.
- [`wireframes/blog-list-hi-fi.html`](wireframes/blog-list-hi-fi.html) —
  standalone high-fidelity application of the approved blog archive layout and
  visual design system.
