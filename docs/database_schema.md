# Database schema

D1 stores comment-system data only; posts and metadata remain Markdown files.
All timestamps are ISO 8601 UTC strings.

## comments

```sql
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    comment TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    ip_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    moderated_at TEXT
);

CREATE INDEX comments_approved_by_post
    ON comments (post_slug, status, created_at);
```

## moderation_tokens

```sql
CREATE TABLE moderation_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
    expires_at TEXT NOT NULL,
    used_at TEXT,
    FOREIGN KEY (comment_id) REFERENCES comments(id)
);

CREATE INDEX moderation_tokens_active
    ON moderation_tokens (token_hash, expires_at, used_at);
```

## comment_rate_limits

```sql
CREATE TABLE comment_rate_limits (
    ip_hash TEXT NOT NULL,
    window_start TEXT NOT NULL,
    submission_count INTEGER NOT NULL CHECK (submission_count >= 0),
    PRIMARY KEY (ip_hash, window_start)
);
```

`window_start` is the UTC date (`YYYY-MM-DD`). Update this row and insert the
pending comment in one transaction.

## Data access contract

`src/lib/comments/repository.ts` is the typed access layer for all three tables.
Route handlers must use it rather than issuing comment-system SQL directly.

Pending-comment creation uses one D1 batch to:

1. Insert or atomically increment the `(ip_hash, window_start)` counter only
   while it is below 10.
2. Insert the pending comment only when the counter changed.
3. Insert the approve and reject token hashes for that comment.

Any SQL error rolls back the batch. A counter that is already at 10 produces no
comment or token rows and is reported as `CommentRateLimitError`.

If Discord delivery fails after creation, `rollbackPendingComment` uses one D1
batch to delete both moderation tokens and the still-pending comment, decrement
its `(ip_hash, window_start)` counter, and remove a zero counter row. It cannot
delete an approved or rejected comment and returns `false` if compensation was
already applied.

Moderation also uses one D1 batch. It validates the hash, action, expiry,
single-use state, and pending comment status; marks both tokens for the comment
used; and changes the comment status. Unknown, mismatched, expired, used, or
already-moderated tokens all return the same `null` result.

Public reads select approved rows only and return only `id`, `name`, `comment`,
and `created_at`, ordered oldest first.

## Hashing contract

The repository computes lowercase hexadecimal SHA-256 values with the Worker
Web Crypto API before preparing SQL:

```text
ip_hash    = SHA-256(IP address + IP_HASH_SECRET)
token_hash = SHA-256(opaque moderation token)
```

Callers provide raw values only as in-memory repository inputs. Raw IP addresses
and raw moderation tokens are never passed to D1 or returned by repository
results. `TURNSTILE_SECRET_KEY` is unrelated to these hashes and is reserved for
server-side Turnstile verification.

## Local verification

`npm run test:d1` uses Cloudflare's Vitest Workers integration and Miniflare to
apply the real migrations to an isolated local D1 database. The focused suite
verifies status filtering, hashing, token expiry and single use, the daily limit,
and transactional rollback. It never connects to the production database.

## Migration policy

Schema changes are forward-only migrations stored in versioned SQL files. Do
not edit an already-applied migration; add a new migration and document it here.

The daily cleanup job deletes records according to the retention schedule in
`comment_moderation_design.md`; cleanup queries must be covered by indexes as
the schema evolves.
