import { getCloudflareContext } from "@opennextjs/cloudflare";
import { chatJsonError, handleChatRequest } from "@/lib/chat/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	const development = process.env.NODE_ENV === "development";
	try {
		const { env } = await getCloudflareContext({ async: true });
		if (!env.BLOG_HELPER || !env.CHAT_RATE_LIMITER) throw new Error("Chat bindings are not configured");
		return await handleChatRequest(request, {
			chatCompletions: (input) => env.BLOG_HELPER.chatCompletions(input),
			clientIdentityFallback: development ? "local-development" : undefined,
			includeErrorDetails: development,
			rateLimit: (key) => env.CHAT_RATE_LIMITER.limit({ key }),
		});
	} catch (error) {
		console.error("Chat API operation failed", error instanceof Error ? error.name : "UnknownError");
		return chatJsonError("unavailable", 503, "binding_initialization", {
			error,
			includeDetails: development,
		});
	}
}
