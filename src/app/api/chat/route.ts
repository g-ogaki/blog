import { getCloudflareContext } from "@opennextjs/cloudflare";
import { handleChatRequest } from "@/lib/chat/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		const { env } = await getCloudflareContext({ async: true });
		if (!env.BLOG_HELPER || !env.CHAT_RATE_LIMITER) throw new Error("Chat bindings are not configured");
		return await handleChatRequest(request, {
			chatCompletions: (input) => env.BLOG_HELPER.chatCompletions(input),
			rateLimit: (key) => env.CHAT_RATE_LIMITER.limit({ key }),
		});
	} catch (error) {
		console.error("Chat API operation failed", error instanceof Error ? error.name : "UnknownError");
		return Response.json({ error: "unavailable", success: false }, {
			headers: { "cache-control": "no-store" },
			status: 503,
		});
	}
}
