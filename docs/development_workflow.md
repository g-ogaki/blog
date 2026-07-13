# Development workflow

Implementation changes follow `AGENTS.md`: use a feature branch, write a
failing test first where practical, update the relevant canonical document, run
the checks, commit and push the completed issue, and open a detailed pull
request. Human review is required before merge, and agents never merge pull
requests automatically.

## Writing a New Post

```text
Create directory
↓
Write Markdown
↓
Add images
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
