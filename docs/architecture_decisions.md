# architecture_decisions.md

## ADR-001

Posts are stored as Markdown files.

Reason:

* Git-friendly
* Simple workflow
* No CMS

---

## ADR-002

Markdown is the single source of truth.

Reason:

* Avoid synchronization issues
* Easy backups
* Easy version control

---

## ADR-003

D1 is used only for comments.

Reason:

* Dynamic functionality only
* Keep content static

---

## ADR-004

Search uses Pagefind.

Reason:

* Full-content search
* Static deployment
* No database

---

## ADR-005

Comment moderation uses Discord.

Reason:

* Existing workflow
* No email infrastructure
* Immediate notifications

---

## ADR-006

Link previews are generated at build time.

Reason:

* Avoid runtime fetching
* Avoid CORS issues
* Faster page rendering

---

## ADR-007

No user accounts.

Reason:

* Simplicity
* Low maintenance
* Privacy

---

## ADR-008

Open Graph images are selected using an explicit frontmatter field.

Reason:

- Predictable behavior
- Avoid accidental thumbnail selection
- Keep author control

Priority:

1. frontmatter image
2. site-wide default image

---