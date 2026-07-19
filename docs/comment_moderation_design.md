# Comment moderation design

## Lifecycle

```text
Comment submitted
↓
Turnstile and rate-limit verification
↓
Pending comment and one-time moderation tokens
↓
Discord notification
↓
Confirmation page → approve or reject
↓
Published when approved
```

The typed Discord message includes post title, public URL, author name, comment,
and separate approve/reject review URLs. User-controlled mentions are disabled.
Each review URL opens a confirmation page; a `GET` request must never approve or
reject a comment. See `api_design.md` for the HTTP contract.

Translated pages share one comment thread keyed by the article directory slug.
The submission locale selects the localized title and public URL included in
Discord. Comments are displayed as submitted and are not translated.

D1 creation happens before Discord delivery so every delivered review link
identifies a stored token. If delivery fails, an atomic compensation batch
removes the still-pending comment, its tokens, and its quota increment. The API
then returns `500`, allowing a new submission rather than retaining an orphan
that cannot be moderated.

## Spam protection

Turnstile is required for every submission. Limit successful, verified
submissions to 10 comments per IP per UTC day. Store `SHA256(IP + SECRET)`,
never the raw IP. The D1 counter is incremented atomically with comment
creation; invalid Turnstile submissions do not consume quota.

Names contain 1-80 characters and comments contain 1-2,000 characters. Comment
content is plain text with line breaks preserved; HTML and Markdown are not
interpreted.

## Token safety

* Generate opaque cryptographically random tokens.
* Store only a SHA-256 token hash.
* Create one token per action and expire it after 24 hours.
* When either action is confirmed, mark both tokens for that comment used so the sibling action cannot be applied later.
* Respond identically for expired, used, and unknown tokens.
* Put tokens only in Discord review URLs and the confirmation POST body; do not log them.

## Retention and deletion

Use a daily scheduled cleanup job to minimize personal data:

| Data | Retention |
| --- | --- |
| Approved comments | Until manually removed or the corresponding post is removed. |
| Pending and rejected comments | Delete 30 days after creation. |
| Used or expired moderation tokens | Delete 7 days after use or expiry. |
| Hashed IP rate-limit counters | Delete 2 days after their UTC window. |

No raw IP address is logged or stored by the application. A moderator may
remove an approved comment at any time; removal deletes the comment and its
associated moderation tokens.

The daily cleanup runs at `03:00 UTC`. It deletes pending/rejected comments at
the 30-day cutoff, tokens at seven days after use or expiry, and UTC-day quota
counters at the two-day cutoff. It also removes approved comments whose slug is
absent from the build-generated published-post manifest. The job receives that
manifest as data and never reads, changes, or generates Markdown content.
