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
npm run build:worker
```

`npm run check` runs ESLint, TypeScript, the jsdom unit suite, isolated local D1
integration tests, and production content validation. The D1 suite applies
`migrations/` through Miniflare and never connects to the configured production
database. Use `npm run test:unit` or `npm run test:d1` to run either suite alone.

Follow the issue, feature branch, human review, and commit workflow in
[`AGENTS.md`](AGENTS.md).
`npm run build:worker` runs the Next.js build through OpenNext and generates the
Cloudflare Worker artifact.

## AI development workflow

Agents may commit and push completed work directly to issue-specific feature
branches without requesting separate approval. Each issue must end in a pull
request with a detailed description of scope, decisions, acceptance criteria,
tests, risks, and follow-up work. Pull requests are the human-in-the-loop review
gate and must never be merged automatically by an agent.

## Documentation

Read [`docs/README.md`](docs/README.md) for the canonical documentation map.
