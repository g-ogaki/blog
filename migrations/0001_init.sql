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

CREATE TABLE comment_rate_limits (
    ip_hash TEXT NOT NULL,
    window_start TEXT NOT NULL,
    submission_count INTEGER NOT NULL CHECK (submission_count >= 0),
    PRIMARY KEY (ip_hash, window_start)
);
