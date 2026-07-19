import { describe, expect, it, vi } from "vitest";
import { handleGetComments, handlePostComment, type CommentApiDependencies } from "./api";
import { CommentRateLimitError } from "./repository";

const validBody = {
	comment: "First line\nSecond line",
	locale: "ja" as const,
	name: " Ada ",
	post_slug: "2026/20260503-learning-typescript",
	turnstile_token: "challenge-token",
};

function dependencies(overrides: Partial<CommentApiDependencies> = {}): CommentApiDependencies {
	return {
		createComment: vi.fn().mockResolvedValue({
			comment: validBody.comment,
			created_at: "2026-07-14T03:00:00.000Z",
			id: 1,
			ip_hash: "hash",
			moderated_at: null,
			name: "Ada",
			post_slug: validBody.post_slug,
			status: "pending",
		}),
		createToken: vi.fn().mockReturnValueOnce("approve-token").mockReturnValueOnce("reject-token"),
		db: {} as D1Database,
		discordWebhookUrl: "https://discord.com/api/webhooks/id/token",
		findPublishedPost: (slug, locale) => slug === validBody.post_slug && locale === validBody.locale
			? { slug, title: "TypeScript", url: `https://monipy.org/blog/${slug}` }
			: undefined,
		ipHashSecret: "ip-secret",
		listComments: vi.fn().mockResolvedValue([]),
		moderationUrl: "https://monipy.org/comments/moderate",
		notifyModerator: vi.fn().mockResolvedValue(undefined),
		rollbackComment: vi.fn().mockResolvedValue(true),
		turnstileSecretKey: "turnstile-secret",
		verifyChallenge: vi.fn().mockResolvedValue(true),
		...overrides,
	};
}

function postRequest(body: unknown, headers: HeadersInit = { "cf-connecting-ip": "203.0.113.8" }) {
	return new Request("https://monipy.org/api/comments", {
		body: JSON.stringify(body),
		headers,
		method: "POST",
	});
}

describe("comment API contract", () => {
	it("verifies Turnstile before creating a pending comment with preserved plain text", async () => {
		const deps = dependencies();
		const response = await handlePostComment(postRequest(validBody), deps);

		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({ success: true });
		expect(deps.verifyChallenge).toHaveBeenCalledWith({
			ipAddress: "203.0.113.8",
			secretKey: "turnstile-secret",
			token: "challenge-token",
		});
		expect(deps.createComment).toHaveBeenCalledWith(deps.db, {
			approveToken: "approve-token",
			comment: "First line\nSecond line",
			ipAddress: "203.0.113.8",
			ipHashSecret: "ip-secret",
			name: "Ada",
			postSlug: validBody.post_slug,
			rejectToken: "reject-token",
		});
		expect(deps.notifyModerator).toHaveBeenCalledWith({
			approveToken: "approve-token",
			comment: validBody.comment,
			moderationUrl: "https://monipy.org/comments/moderate",
			name: "Ada",
			postTitle: "TypeScript",
			postUrl: `https://monipy.org/blog/${validBody.post_slug}`,
			rejectToken: "reject-token",
			webhookUrl: "https://discord.com/api/webhooks/id/token",
		});
	});

	it("rejects invalid, unpublished, and failed-challenge submissions before writing", async () => {
		const cases = [
			{ body: { ...validBody, comment: " ".repeat(2_001) }, expected: 400 },
			{ body: { ...validBody, locale: "fr" }, expected: 400 },
			{ body: { ...validBody, post_slug: "2026/20260504-draft" }, expected: 400 },
			{ body: validBody, expected: 403, verifyChallenge: vi.fn().mockResolvedValue(false) },
		];

		for (const testCase of cases) {
			const deps = dependencies({ verifyChallenge: testCase.verifyChallenge });
			const response = await handlePostComment(postRequest(testCase.body), deps);
			expect(response.status).toBe(testCase.expected);
			expect(deps.createComment).not.toHaveBeenCalled();
		}
	});

	it("maps the repository quota error to 429 after successful verification", async () => {
		const deps = dependencies({ createComment: vi.fn().mockRejectedValue(new CommentRateLimitError()) });
		const response = await handlePostComment(postRequest(validBody), deps);
		expect(response.status).toBe(429);
		expect(deps.verifyChallenge).toHaveBeenCalledOnce();
	});

	it("removes the pending record and quota when Discord delivery fails", async () => {
		const notificationError = new Error("notification failed");
		const storedComment = {
			comment: validBody.comment,
			created_at: "2026-07-14T03:00:00.000Z",
			id: 1,
			ip_hash: "hash",
			moderated_at: null,
			name: "Ada",
			post_slug: validBody.post_slug,
			status: "pending" as const,
		};
		const deps = dependencies({
			createComment: vi.fn().mockResolvedValue(storedComment),
			notifyModerator: vi.fn().mockRejectedValue(notificationError),
		});

		await expect(handlePostComment(postRequest(validBody), deps)).rejects.toBe(notificationError);
		expect(deps.rollbackComment).toHaveBeenCalledWith(deps.db, storedComment);
	});

	it("requires Cloudflare's trusted client IP header", async () => {
		const deps = dependencies();
		const response = await handlePostComment(postRequest(validBody, {}), deps);
		expect(response.status).toBe(500);
		expect(deps.verifyChallenge).not.toHaveBeenCalled();
		expect(deps.createComment).not.toHaveBeenCalled();
	});

	it("returns approved repository results only for a published post", async () => {
		const comments = [{ id: 1, name: "Ada", comment: "Hello", created_at: "2026-05-03T10:00:00.000Z" }];
		const deps = dependencies({ listComments: vi.fn().mockResolvedValue(comments) });
		const response = await handleGetComments(
			new Request(`https://monipy.org/api/comments?post=${validBody.post_slug}&locale=${validBody.locale}`),
			deps,
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ comments });
		expect(deps.listComments).toHaveBeenCalledWith(deps.db, validBody.post_slug);
	});
});
