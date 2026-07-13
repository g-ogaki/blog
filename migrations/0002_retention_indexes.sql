CREATE INDEX comments_retention
    ON comments (status, created_at);

CREATE INDEX moderation_tokens_expiry
    ON moderation_tokens (expires_at);

CREATE INDEX moderation_tokens_used
    ON moderation_tokens (used_at)
    WHERE used_at IS NOT NULL;

CREATE INDEX comment_rate_limits_retention
    ON comment_rate_limits (window_start);
