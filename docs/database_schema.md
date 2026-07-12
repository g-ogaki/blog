# database_schema.md

## comments

```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    comment TEXT NOT NULL,
    status TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);
```

status:

* pending
* approved
* rejected

---

## moderation_tokens

```sql
CREATE TABLE moderation_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    action TEXT NOT NULL,
    expires_at TEXT NOT NULL
);
```

action:

* approve
* reject

---