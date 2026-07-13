import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import {
	CommentRateLimitError,
	createPendingComment,
	dailyCommentLimit,
	listApprovedComments,
	moderateComment,
} from "../../src/lib/comments/repository";
import { hashIpAddress, hashModerationToken } from "../../src/lib/comments/hashing";

const now = new Date("2026-07-14T03:00:00.000Z");

function pendingInput(index = 1) {
	return {
		approveToken: `approve-${index}`,
		comment: `comment-${index}`,
		ipAddress: "203.0.113.10",
		ipHashSecret: "test-secret",
		name: "Ada",
		now,
		postSlug: "2026/20260503-learning-typescript",
		rejectToken: `reject-${index}`,
	};
}

describe("comment repository", () => {
	beforeEach(async () => {
		await env.DB.batch([
			env.DB.prepare("DELETE FROM moderation_tokens"),
			env.DB.prepare("DELETE FROM comments"),
			env.DB.prepare("DELETE FROM comment_rate_limits"),
		]);
	});

	it("stores only hashes, returns only approved comments, and consumes moderation tokens once", async () => {
		const stored = await createPendingComment(env.DB, pendingInput());
		const expectedIpHash = await hashIpAddress("203.0.113.10", "test-secret");
		const expectedTokenHash = await hashModerationToken("approve-1");

		expect(stored).toMatchObject({ ip_hash: expectedIpHash, status: "pending" });
		expect(await env.DB.prepare("SELECT token_hash FROM moderation_tokens ORDER BY action").all()).toMatchObject({
			results: [{ token_hash: expectedTokenHash }, { token_hash: await hashModerationToken("reject-1") }],
		});
		const persistedRows = await Promise.all([
			env.DB.prepare("SELECT * FROM comments").all(),
			env.DB.prepare("SELECT * FROM moderation_tokens").all(),
			env.DB.prepare("SELECT * FROM comment_rate_limits").all(),
		]);
		expect(JSON.stringify(persistedRows)).not.toContain("203.0.113.10");
		expect(JSON.stringify(persistedRows)).not.toContain("approve-1");
		expect(await listApprovedComments(env.DB, pendingInput().postSlug)).toEqual([]);

		const approved = await moderateComment(env.DB, { action: "approve", now, token: "approve-1" });
		expect(approved).toMatchObject({ id: stored.id, status: "approved", moderated_at: now.toISOString() });
		expect(await listApprovedComments(env.DB, pendingInput().postSlug)).toEqual([{
			comment: "comment-1",
			created_at: now.toISOString(),
			id: stored.id,
			name: "Ada",
		}]);
		expect(await moderateComment(env.DB, { action: "reject", now, token: "reject-1" })).toBeNull();

		await createPendingComment(env.DB, pendingInput(2));
		const afterExpiry = new Date(now.getTime() + 25 * 60 * 60 * 1000);
		expect(await moderateComment(env.DB, { action: "approve", now: afterExpiry, token: "approve-2" })).toBeNull();
	});

	it("enforces ten comments per hashed IP and UTC day", async () => {
		for (let index = 1; index <= dailyCommentLimit; index += 1) {
			await createPendingComment(env.DB, pendingInput(index));
		}

		await expect(createPendingComment(env.DB, pendingInput(dailyCommentLimit + 1))).rejects.toBeInstanceOf(
			CommentRateLimitError,
		);
		expect(await env.DB.prepare("SELECT COUNT(*) AS count FROM comments").first<{ count: number }>()).toEqual({ count: 10 });
		expect(await env.DB.prepare("SELECT submission_count FROM comment_rate_limits").first()).toEqual({ submission_count: 10 });
	});

	it("rolls back rate-limit and comment writes when token insertion fails", async () => {
		const input = pendingInput();
		input.rejectToken = input.approveToken;

		await expect(createPendingComment(env.DB, input)).rejects.toThrow();
		expect(await env.DB.prepare("SELECT COUNT(*) AS count FROM comments").first()).toEqual({ count: 0 });
		expect(await env.DB.prepare("SELECT COUNT(*) AS count FROM comment_rate_limits").first()).toEqual({ count: 0 });
	});
});
