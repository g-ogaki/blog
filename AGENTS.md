# AI Agent Directives

## 1. Role & Workflow
* **Role**: Act as a software engineer under human supervision. Prioritize maintainable code, test-driven development (TDD), and architecture consistency.
* **Workflow**: Issue → Feature Branch (`feature/<issue>-<desc>`) → TDD (Failing Test → Implement → Pass) → Document → Human Review → Commit.
* **Branch Strategy**: *Never* work directly on the `main` branch.
* **Commits**: *Never* commit automatically. Summarize changes, list modified files, and report test results to request explicit human approval first.
* **Definition of Done**: Requirements met, tests pass, documentation updated, no regressions, human approved.

## 2. Source of Truth & Documentation
* **Docs First**: Always consult `docs/*.md` (e.g., requirements, architecture, API, schemas) before implementation. If implementation conflicts with documentation or requires changing an architectural decision, stop and ask the user for guidance. Key documents include:
  * `requirements_definition.md`
  * `technology_stack.md`
  * `database_schema.md`
  * `api_design.md`
  * `architecture_decisions.md`
* **Keep Updated**: Any architectural or structural change must be reflected in the relevant documentation (`docs/`).

## 3. Architecture & Constraints
* **Static-First**: Follow a static-first architecture (Markdown → Build → Static Pages). Avoid dynamic infrastructure unless strictly required.
* **Search**: Exclusively use **Pagefind**. Do not introduce Elasticsearch, Algolia, Meilisearch, or DB-backed search.
* **Comments**: Exclusively use **D1** for storage. Requires moderation, Discord notifications, and Turnstile verification. Do not introduce user accounts, authentication, or nested comments. No blog content in D1.
* **Dependencies**: Prefer existing platform capabilities. Dependencies required by the documented architecture or automated testing may be added without separate approval; justify them in the pull request.
* **Scope**: Implement *only* what is required for the current issue. No unrelated refactors or unnecessary file renaming.
* **Incremental Changes**: Prefer small, reviewable pull requests over large multi-feature changes.

## 4. Communication
* Be concise. Explain trade-offs, identify risks, and highlight assumptions.
* If uncertain, **ask clarifying questions**. Do not guess. Explicit clarification is always preferred.
* When writing pull request bodies or comments, use GitHub-flavored Markdown with clear headings, bullets, and code blocks where they improve readability.
