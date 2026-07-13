# API design

All API responses are JSON, except the moderation confirmation page. Error
responses use `{ "success": false, "error": "…" }`.

## POST /api/comments

Creates a pending comment. The server verifies Turnstile and enforces the rate
limit before writing to D1.

```json
{
  "post_slug": "2026/20260503-learning-typescript",
  "name": "Ada",
  "comment": "Helpful explanation.",
  "turnstile_token": "…"
}
```

All fields are required. `post_slug` is the path after `/blog/` and must identify
a published post. `name` contains 1-80 characters and `comment` contains
1-2,000 characters. Comments are stored and returned as plain text; clients
preserve line breaks and never interpret comment content as markup.

Success (`201`): `{ "success": true }`

Failures: `400` invalid input, `403` failed Turnstile verification, `429` rate
limited, `500` unexpected server error. Do not disclose post existence in an
input-validation error.

## GET /api/comments

Returns approved comments for `post=2026/20260503-learning-typescript` (the
path after `/blog/`).

```json
{
  "comments": [
    { "id": 1, "name": "Ada", "comment": "Helpful explanation.", "created_at": "2026-05-03T10:00:00Z" }
  ]
}
```

Failures: `400` missing or invalid `post`, `500` unexpected server error.

## GET /comments/moderate

Shows a confirmation page for a Discord review token. It never changes state,
so link scanners and preview bots are safe.

## POST /api/comments/moderate

Confirms an action from the moderation page:

```json
{ "token": "…", "action": "approve" }
```

`action` is `approve` or `reject`. Tokens are single-use, expire, and are
stored only as hashes. Consuming the token and updating the comment must occur
in one transaction. Failures: `400` invalid action, `404` invalid/expired/used
token, `500` unexpected server error.
