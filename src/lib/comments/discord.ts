export interface DiscordCommentNotification {
	approveToken: string;
	comment: string;
	moderationUrl: string;
	name: string;
	postTitle: string;
	postUrl: string;
	rejectToken: string;
	webhookUrl: string;
}

export class DiscordNotificationError extends Error {
	constructor() {
		super("Discord notification failed");
		this.name = "DiscordNotificationError";
	}
}

function escapeDiscordMarkdown(value: string) {
	return value.replace(/([\\`*_~|>\[\]])/g, "\\$1");
}

function reviewUrl(baseUrl: string, token: string, action: "approve" | "reject") {
	const url = new URL(baseUrl);
	url.searchParams.set("token", token);
	url.searchParams.set("action", action);
	return url.toString();
}

export async function sendDiscordCommentNotification(
	input: DiscordCommentNotification,
	fetcher: typeof fetch = fetch,
) {
	const approveUrl = reviewUrl(input.moderationUrl, input.approveToken, "approve");
	const rejectUrl = reviewUrl(input.moderationUrl, input.rejectToken, "reject");
	const payload = {
		allowed_mentions: { parse: [] },
		embeds: [
			{
				color: 0xd54b2b,
				description: escapeDiscordMarkdown(input.comment),
				fields: [
					{
						name: "Post",
						value: `[${escapeDiscordMarkdown(input.postTitle).slice(0, 700)}](${input.postUrl})`,
					},
					{ name: "Name", value: escapeDiscordMarkdown(input.name) },
					{ name: "Review", value: `[Approve](${approveUrl}) · [Reject](${rejectUrl})` },
				],
				timestamp: new Date().toISOString(),
				title: "New comment awaiting moderation",
			},
		],
	};

	let response: Response;
	try {
		response = await fetcher(input.webhookUrl, {
			body: JSON.stringify(payload),
			headers: { "content-type": "application/json" },
			method: "POST",
			signal: AbortSignal.timeout(5_000),
		});
	} catch {
		throw new DiscordNotificationError();
	}

	if (!response.ok) throw new DiscordNotificationError();
}
