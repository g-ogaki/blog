import { hashIpAddress, hashModerationToken } from "./hashing";

export const dailyCommentLimit = 10;
const moderationTokenLifetimeMs = 24 * 60 * 60 * 1000;

export type CommentStatus = "pending" | "approved" | "rejected";
export type ModerationAction = "approve" | "reject";

export interface PublicComment {
	comment: string;
	created_at: string;
	id: number;
	name: string;
}

export interface StoredComment extends PublicComment {
	ip_hash: string;
	moderated_at: string | null;
	post_slug: string;
	status: CommentStatus;
}

export interface CreatePendingCommentInput {
	approveToken: string;
	comment: string;
	ipAddress: string;
	ipHashSecret: string;
	name: string;
	now?: Date;
	postSlug: string;
	rejectToken: string;
}

export interface ModerateCommentInput {
	action: ModerationAction;
	now?: Date;
	token: string;
}

export class CommentRateLimitError extends Error {
	constructor() {
		super("The daily comment limit has been reached");
		this.name = "CommentRateLimitError";
	}
}

export async function createPendingComment(
	db: D1Database,
	input: CreatePendingCommentInput,
): Promise<StoredComment> {
	const now = input.now ?? new Date();
	const createdAt = now.toISOString();
	const windowStart = createdAt.slice(0, 10);
	const expiresAt = new Date(now.getTime() + moderationTokenLifetimeMs).toISOString();
	const [ipHash, approveTokenHash, rejectTokenHash] = await Promise.all([
		hashIpAddress(input.ipAddress, input.ipHashSecret),
		hashModerationToken(input.approveToken),
		hashModerationToken(input.rejectToken),
	]);

	const [, commentResult] = await db.batch<StoredComment>([
		db.prepare(`
			INSERT INTO comment_rate_limits (ip_hash, window_start, submission_count)
			VALUES (?1, ?2, 1)
			ON CONFLICT (ip_hash, window_start) DO UPDATE
			SET submission_count = submission_count + 1
			WHERE submission_count < ?3
		`).bind(ipHash, windowStart, dailyCommentLimit),
		db.prepare(`
			INSERT INTO comments (post_slug, name, comment, status, ip_hash, created_at, moderated_at)
			SELECT ?1, ?2, ?3, 'pending', ?4, ?5, NULL
			WHERE changes() = 1
			RETURNING id, post_slug, name, comment, status, ip_hash, created_at, moderated_at
		`).bind(input.postSlug, input.name, input.comment, ipHash, createdAt),
		db.prepare(`
			WITH new_comment (id) AS MATERIALIZED (
				SELECT last_insert_rowid() WHERE changes() = 1
			)
			INSERT INTO moderation_tokens (comment_id, token_hash, action, expires_at, used_at)
			SELECT id, ?1, 'approve', ?2, NULL FROM new_comment
			UNION ALL
			SELECT id, ?3, 'reject', ?2, NULL FROM new_comment
		`).bind(approveTokenHash, expiresAt, rejectTokenHash),
	]);

	const comment = commentResult.results[0];
	if (!comment) throw new CommentRateLimitError();
	return comment;
}

export async function listApprovedComments(db: D1Database, postSlug: string) {
	const result = await db.prepare(`
		SELECT id, name, comment, created_at
		FROM comments
		WHERE post_slug = ?1 AND status = 'approved'
		ORDER BY created_at ASC, id ASC
	`).bind(postSlug).all<PublicComment>();
	return result.results;
}

export async function rollbackPendingComment(db: D1Database, comment: StoredComment) {
	const windowStart = comment.created_at.slice(0, 10);
	const [, commentResult] = await db.batch<{ id: number }>([
		db.prepare(`
			DELETE FROM moderation_tokens
			WHERE comment_id = ?1
				AND EXISTS (SELECT 1 FROM comments WHERE id = ?1 AND status = 'pending')
		`).bind(comment.id),
		db.prepare(`
			DELETE FROM comments
			WHERE id = ?1 AND status = 'pending'
			RETURNING id
		`).bind(comment.id),
		db.prepare(`
			UPDATE comment_rate_limits
			SET submission_count = submission_count - 1
			WHERE ip_hash = ?1 AND window_start = ?2 AND changes() = 1
		`).bind(comment.ip_hash, windowStart),
		db.prepare(`
			DELETE FROM comment_rate_limits
			WHERE ip_hash = ?1 AND window_start = ?2 AND submission_count = 0
		`).bind(comment.ip_hash, windowStart),
	]);

	return Boolean(commentResult.results[0]);
}

export async function moderateComment(
	db: D1Database,
	input: ModerateCommentInput,
): Promise<StoredComment | null> {
	const now = (input.now ?? new Date()).toISOString();
	const tokenHash = await hashModerationToken(input.token);
	const status: CommentStatus = input.action === "approve" ? "approved" : "rejected";

	const [, commentResult] = await db.batch<StoredComment>([
		db.prepare(`
			WITH target (comment_id) AS MATERIALIZED (
				SELECT moderation_tokens.comment_id
				FROM moderation_tokens
				JOIN comments ON comments.id = moderation_tokens.comment_id
				WHERE moderation_tokens.token_hash = ?1
					AND moderation_tokens.action = ?2
					AND moderation_tokens.expires_at > ?3
					AND moderation_tokens.used_at IS NULL
					AND comments.status = 'pending'
			)
			UPDATE moderation_tokens
			SET used_at = ?3
			WHERE comment_id = (SELECT comment_id FROM target)
				AND used_at IS NULL
		`).bind(tokenHash, input.action, now),
		db.prepare(`
			UPDATE comments
			SET status = ?1, moderated_at = ?2
			WHERE id = (
				SELECT comment_id
				FROM moderation_tokens
				WHERE token_hash = ?3 AND action = ?4 AND used_at = ?2
			)
				AND status = 'pending'
			RETURNING id, post_slug, name, comment, status, ip_hash, created_at, moderated_at
		`).bind(status, now, tokenHash, input.action),
	]);

	return commentResult.results[0] ?? null;
}
