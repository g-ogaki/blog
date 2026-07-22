# Development workflow

Implementation changes follow `AGENTS.md`: use a feature branch, write a
failing test first where practical, update the relevant canonical document, run
the checks, commit and push the completed issue, and open a detailed pull
request. Human review is required before merge, and agents never merge pull
requests automatically.

Before merge, review the Cloudflare branch preview and require both GitHub CI
and Workers Builds to pass. The canonical preview and production checklists are
in `deployment_design.md`. Branch previews isolate code but currently share the
production Worker's D1 and secrets, so comment submissions there are not test
data.

## Writing a New Post

Start the authoring server once:

```sh
npm run dev
```

The command publishes draft and published assets, generates published metadata,
starts Next.js, and then watches `content/posts` recursively. Markdown changes,
asset additions, replacements, renames, deletions, and new post directories are
debounced and prepared automatically. Modifying an existing Markdown or asset
file keeps Next.js running and uses native development reload. Persistent file
additions, deletions, and renames restart Next.js once after successful
preparation. If an in-progress edit is invalid, the development page may show an
error until saving a valid change retries preparation.
Draft article URLs are available in this local development process while
remaining excluded from production builds and deployed routes.

External link previews are not refreshed by the watcher. After adding or
changing a standalone external URL, continue to run
`npm run refresh:link-previews` explicitly.

```text
Create directory
↓
Write Markdown
↓
Add images
↓
Refresh external link previews when needed
↓
Preview locally
↓
Commit
↓
Push
↓
Open pull request
↓
Request review and approval
↓
Cloudflare Build
↓
Deploy
```

---

## Publishing Drafts

Draft:

```yaml
draft: true
```

Published:

```yaml
draft: false
```

---

## Comment Moderation

```text
Reader submits comment
↓
Discord notification
↓
Open review page and confirm approve/reject
↓
Comment state updated
```

---
