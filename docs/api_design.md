# api_design.md

## POST /api/comments

Creates pending comment.

Validation:

* Name required
* Comment required
* Turnstile verification
* Rate limit check

Response:

```json
{
  "success": true
}
```

---

## GET /api/comments

Returns approved comments for a post.

Example:

```text
/api/comments?post=20260503-learning-typescript
```

---

## GET /api/comments/moderate

Parameters:

```text
token
action
```

Example:

```text
/api/comments/moderate?token=xxx&action=approve
```

Actions:

* approve
* reject

---