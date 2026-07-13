import { describe, expect, it, vi } from "vitest";
import { DiscordNotificationError, sendDiscordCommentNotification } from "./discord";

const notification = {
	approveToken: "approve-token",
	comment: "Hello @everyone\n**not formatting**",
	moderationUrl: "https://monipy.org/comments/moderate",
	name: "Ada_[test]",
	postTitle: "TypeScript [notes]",
	postUrl: "https://monipy.org/blog/2026/post",
	rejectToken: "reject-token",
	webhookUrl: "https://discord.com/api/webhooks/id/token",
};

describe("Discord comment notification", () => {
	it("sends bounded review links and disables user-controlled mentions", async () => {
		const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
		await sendDiscordCommentNotification(notification, fetcher);

		const [url, init] = fetcher.mock.calls[0];
		const payload = JSON.parse(init.body);
		expect(url).toBe(notification.webhookUrl);
		expect(payload.allowed_mentions).toEqual({ parse: [] });
		expect(payload.embeds[0].description).toBe("Hello @everyone\n\\*\\*not formatting\\*\\*");
		expect(payload.embeds[0].fields[2].value).toContain(
			"https://monipy.org/comments/moderate?token=approve-token&action=approve",
		);
		expect(payload.embeds[0].fields[2].value).toContain(
			"https://monipy.org/comments/moderate?token=reject-token&action=reject",
		);
	});

	it("fails closed for network and non-success responses", async () => {
		const fetchers = [
			vi.fn().mockRejectedValue(new Error("network")),
			vi.fn().mockResolvedValue(new Response(null, { status: 429 })),
		];
		for (const fetcher of fetchers) {
			await expect(sendDiscordCommentNotification(notification, fetcher)).rejects.toBeInstanceOf(
				DiscordNotificationError,
			);
		}
	});
});
