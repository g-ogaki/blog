# API design

API responses are JSON except the moderation confirmation page and successful
chat SSE streams. Error responses use `{ "success": false, "error": "…" }`.

## POST /api/chat

Streams a homepage site-guide response. The JSON request contains `locale`
(`ja` or `en`) and an alternating `messages` array that starts and ends with a
user message. It contains at most three completed user/assistant exchanges plus
the current user message. User messages contain 1-200 trimmed Unicode
characters; assistant messages contain 1-600. System, developer, and tool roles
are rejected because the route injects its own system prompt.

The route requires an exact same-origin `Origin`, `application/json`, and
Cloudflare's `CF-Connecting-IP`. During `next dev` only, a fixed
`local-development` identity replaces the unavailable Cloudflare header. It
reads at most 12,000 request bytes, applies the `CHAT_RATE_LIMITER` result before
inference, and enforces a 20-second total deadline and 600-character output
limit.

Success uses `text/event-stream` with application-owned events:

```text
event: sources
data: {"sources":[{"locale":"en","title":"Article","url":"https://monipy.org/en/blog/…"}]}

event: delta
data: {"text":"…"}

event: done
data: {}
```

Sources are deduplicated, limited to three, and restricted to the exact
`https://monipy.org` origin. Japanese and English routes with the same path
after removing `/en` count as one logical source; the request locale wins when
both translations exist, while the other locale remains available as fallback.
Titles omit the repeated ` | moni's page` suffix. Mid-stream failures use an `error` event with a
stable `provider_unavailable` or `timeout` code. Operational JSON and SSE errors
also include a safe `stage`: `binding_initialization`, `client_identity`,
`rate_limiter`, `provider_startup`, `provider_stream`, or `timeout`. Pre-stream
failures use bounded JSON errors: `400` invalid input, `403` cross-origin, `429`
rate limited, `503` unavailable or quota exhausted, and `504` timeout. Only
`next dev` responses add a bounded error name and message under `detail`; stacks,
requests, prompts, retrieved content, and credentials are never returned.

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
