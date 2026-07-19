# API design

All API responses are JSON, except the moderation confirmation page. Error
responses use `{ "success": false, "error": "…" }`.

## POST /api/comments

Creates a pending comment. The server verifies Turnstile and enforces the rate
limit before writing to D1.

```json
{
  "post_slug": "2026/20260503-learning-typescript",
  "locale": "en",
  "name": "Ada",
  "comment": "Helpful explanation.",
  "turnstile_token": "…"
}
```

All fields are required. `post_slug` is the language-independent article slug
after `/blog/` or `/en/blog/`, and `locale` is `ja` or `en`; together
they must identify a published translation. `name` contains 1-80 characters and `comment` contains
1-2,000 characters. Comments are stored and returned as plain text; clients
preserve line breaks and never interpret comment content as markup.

Success (`201`): `{ "success": true }`

Failures: `400` invalid input, `403` failed Turnstile verification, `429` rate
limited, `500` unexpected server error. Do not disclose post existence in an
input-validation error.

The route trusts only Cloudflare's `CF-Connecting-IP` header for the quota key
and Turnstile `remoteip`; it does not fall back to client-controlled forwarding
headers. A missing trusted IP or unavailable/malformed Siteverify response is a
`500`, while a well-formed Siteverify rejection is a `403`. Turnstile is checked
before the repository performs its atomic quota increment and pending-comment
insert. Raw IP addresses, Turnstile tokens, and secrets are never logged.

After the D1 write, the route sends a typed Discord notification containing the
post, comment, and separate approve/reject review links. A Discord transport or
non-success response produces `500`; before returning, the route atomically
removes the still-pending comment, both token hashes, and that submission's
quota increment so a retry does not leave an unreviewable record.

## GET /api/comments

Returns approved shared comments for
`post=2026/20260503-learning-typescript&locale=en`. Both localized pages read
the same thread while locale validation proves that the requesting translation
is published.

```json
{
  "comments": [
    { "id": 1, "name": "Ada", "comment": "Helpful explanation.", "created_at": "2026-05-03T10:00:00Z" }
  ]
}
```

Failures: `400` missing or invalid `post`, `500` unexpected server error.
Unpublished and unknown post paths use the same `400` response as malformed
paths, so validation does not disclose content state.

Published-post validation reads the build-generated slug manifest rather than
loading Markdown from the filesystem at request time. This preserves the
static-first content boundary and avoids bundling the authoring toolchain into
the dynamic Worker route.

## GET /comments/moderate

Shows a confirmation page for a Discord review token. It performs no database
lookup and never changes state, so link scanners and preview bots are safe.
Syntactically valid links all render the same confirmation without disclosing
token state; malformed links show a generic unavailable message. After the
confirmed POST, unknown, expired, and used tokens share that same unavailable
message. The page sets `noindex`, `nofollow`, and a `no-referrer` policy, and
mutation is performed only after the moderator presses the confirmation button.

## POST /api/comments/moderate

Confirms an action from the moderation page:

```json
{ "token": "…", "action": "approve" }
```

`action` is `approve` or `reject`. Tokens are single-use, expire, and are
stored only as hashes. Consuming the token and updating the comment must occur
in one transaction. Failures: `400` invalid action, `404` invalid/expired/used
token, `500` unexpected server error.

Success (`200`): `{ "success": true, "status": "approved" }` or the equivalent
`rejected` status. Unknown, malformed, expired, used, action-mismatched, and
already-moderated tokens share the same `404` response.
