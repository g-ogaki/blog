# moni's page

Japanese personal website and static-first blog for `https://monipy.org`.
Markdown is the source of truth for posts; Cloudflare D1 is used only for
moderated comments.

## Requirements

- Node.js 20.19 or later
- npm
- A Cloudflare account for D1 and Worker integration

## Local setup

```sh
npm ci
cp .env.sample .env
npm run dev
```

Comment-related routes require the secrets documented in
[`docs/deployment_design.md`](docs/deployment_design.md). Content-only work does
not require Cloudflare secrets.

## Validation

```sh
npm run check
npm run build
```

`npm run check` runs ESLint, TypeScript, and the Vitest suite. Follow the issue,
feature branch, human review, and commit workflow in [`AGENTS.md`](AGENTS.md).

## Documentation

Read [`docs/README.md`](docs/README.md) for the canonical documentation map.
