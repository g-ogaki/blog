# AI Agent Directives

## 1. Role & Workflow
* **Role**: Act as a software engineer under human supervision. Prioritize maintainable code, architecture consistency, and effective regression prevention.
* **Workflow**: Issue → Feature Branch (`feature/<issue>-<desc>`) → Implement and Verify → Document → Commit and Push → Pull Request → Human Review → Merge.
* **Branch Strategy**: *Never* work directly on the `main` branch.
* **Commits**: Commit and push completed issue work without requesting separate approval. Keep commits scoped and use descriptive messages.
* **Human Review**: A pull request is the required human-in-the-loop gate. Never merge a pull request automatically; leave review and merge decisions to the human supervisor.
* **Definition of Done**: Requirements met, tests pass, documentation updated, no regressions, pull request opened, and human approved.

## 2. Testing Strategy
* **Risk-Based Testing**: Automated tests are required for behavior where a regression would be costly, subtle, security-sensitive, or difficult to catch during pull request review. Writing a failing test before implementation is encouraged for confirmed bugs when useful, but is not mandatory.
* **Priority Areas**: Test regression fixes, content validation and draft exclusion, security and privacy boundaries, parsing and transformation logic, API and database contracts, and nontrivial branching or edge cases.
* **Concise Cases**: Use the smallest number of focused cases that establish the behavioral contract. Prefer representative inputs and clear assertions over exhaustive combinations or duplicated coverage.
* **Avoid Low-Value Tests**: Do not test trivial markup, static copy, obvious assignments, framework behavior, CSS implementation details, or private implementation structure unless they form an accessibility or public contract.
* **Maintenance**: Keep the existing relevant suite passing. Update or remove tests when behavior intentionally changes, and do not preserve brittle tests that no longer protect a meaningful contract.
* **Reporting**: Pull requests must list the automated checks performed and identify important behavior that remains manually verified or untested.

## 3. Source of Truth & Documentation
* **Docs First**: Always consult `docs/*.md` (e.g., requirements, architecture, API, schemas) before implementation. If implementation conflicts with documentation or requires changing an architectural decision, stop and ask the user for guidance. Key documents include:
  * `requirements_definition.md`
  * `technology_stack.md`
  * `database_schema.md`
  * `api_design.md`
  * `architecture_decisions.md`
* **Keep Updated**: Any architectural or structural change must be reflected in the relevant documentation (`docs/`).

## 4. Architecture & Constraints
* **Static-First**: Follow a static-first architecture (Markdown → Build → Static Pages). Avoid dynamic infrastructure unless strictly required.
* **Search**: Exclusively use **Pagefind**. Do not introduce Elasticsearch, Algolia, Meilisearch, or DB-backed search.
* **Comments**: Exclusively use **D1** for storage. Requires moderation, Discord notifications, and Turnstile verification. Do not introduce user accounts, authentication, or nested comments. No blog content in D1.
* **Dependencies**: Prefer existing platform capabilities. Dependencies required by the documented architecture or automated testing may be added without separate approval; justify them in the pull request.
* **Scope**: Implement *only* what is required for the current issue. No unrelated refactors or unnecessary file renaming.
* **Incremental Changes**: Prefer small, reviewable pull requests over large multi-feature changes.

## 5. Communication
* Be concise. Explain trade-offs, identify risks, and highlight assumptions.
* Prefer detailed issue and pull request descriptions that record scope, decisions, acceptance criteria, testing, risks, and follow-up work.
* If uncertain, **ask clarifying questions**. Do not guess. Explicit clarification is always preferred.
* When writing pull request bodies or comments, use GitHub-flavored Markdown with clear headings, bullets, and code blocks where they improve readability.
