# comment_moderation_design.md

## Workflow

```text
Comment Submitted
↓
Pending
↓
Discord Notification
↓
Approve / Reject
↓
Published
```

---

## Discord Message

```text
📝 New Comment Pending Approval

Post:
{title}

URL:
{url}

Author:
{name}

Comment:
{comment}

Approve:
{approve_url}

Reject:
{reject_url}
```

---

## Spam Protection

### Turnstile

Required for every submission.

### Rate Limiting

Limit:

```text
10 comments per IP per day
```

IP stored as:

```text
SHA256(IP + SECRET)
```

Raw IPs are not stored.

---