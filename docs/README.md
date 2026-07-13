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
| Search | `search_design.md` |
| Comment lifecycle and abuse controls | `comment_moderation_design.md` |
| HTTP contract | `api_design.md` |
| D1 schema | `database_schema.md` |
| Delivery and secrets | `deployment_design.md` |

Other documents should link to the canonical document instead of duplicating its rules.
