# Development workflow

Implementation changes follow `AGENTS.md`: use a feature branch, write a
failing test first where practical, update the relevant canonical document, run
the checks, and obtain human approval before committing.

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
Request review and approval
↓
Commit
↓
Push
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
