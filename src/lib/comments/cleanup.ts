const dayMs = 24 * 60 * 60 * 1000;

export interface CleanupCommentDataInput {
	now?: Date;
	publishedPostSlugs: readonly string[];
}

export interface CleanupCommentDataResult {
	comments: number;
	rateLimits: number;
	tokens: number;
}

function placeholders(count: number) {
	return Array.from({ length: count }, (_, index) => `?${index + 2}`).join(", ");
}

export async function cleanupExpiredCommentData(
	db: D1Database,
	input: CleanupCommentDataInput,
): Promise<CleanupCommentDataResult> {
	const now = input.now ?? new Date();
	const commentCutoff = new Date(now.getTime() - 30 * dayMs).toISOString();
	const tokenCutoff = new Date(now.getTime() - 7 * dayMs).toISOString();
	const rateLimitCutoff = new Date(now.getTime() - 2 * dayMs).toISOString().slice(0, 10);
	const publishedPlaceholders = placeholders(input.publishedPostSlugs.length);
	const removedPostCondition = input.publishedPostSlugs.length
		? `post_slug NOT IN (${publishedPlaceholders})`
		: "1 = 1";
	const publishedBindings: (string | number)[] = [commentCutoff, ...input.publishedPostSlugs];

	const results = await db.batch([
		db.prepare(`
			DELETE FROM moderation_tokens
			WHERE expires_at <= ?1 OR (used_at IS NOT NULL AND used_at <= ?1)
		`).bind(tokenCutoff),
		db.prepare(`
			DELETE FROM moderation_tokens
			WHERE comment_id IN (
				SELECT id FROM comments
				WHERE (status IN ('pending', 'rejected') AND created_at <= ?1)
					OR (status = 'approved' AND ${removedPostCondition})
			)
		`).bind(...publishedBindings),
		db.prepare(`
			DELETE FROM comments
			WHERE (status IN ('pending', 'rejected') AND created_at <= ?1)
				OR (status = 'approved' AND ${removedPostCondition})
		`).bind(...publishedBindings),
		db.prepare(`
			DELETE FROM comment_rate_limits
			WHERE window_start <= ?1
		`).bind(rateLimitCutoff),
	]);

	return {
		comments: results[2].meta.changes,
		rateLimits: results[3].meta.changes,
		tokens: results[0].meta.changes + results[1].meta.changes,
	};
}
