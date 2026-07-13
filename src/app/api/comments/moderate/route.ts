import { getCloudflareContext } from "@opennextjs/cloudflare";
import { handleModerateComment } from "@/lib/comments/moderation-api";

export const dynamic = "force-dynamic";

function serverError(error: unknown) {
	console.error("Comment moderation failed", error instanceof Error ? error.name : "UnknownError");
	return Response.json({ success: false, error: "Moderation service is unavailable." }, { status: 500 });
}

export async function POST(request: Request) {
	try {
		const { env } = await getCloudflareContext({ async: true });
		if (!env.DB) throw new Error("D1 database binding is not configured");
		return await handleModerateComment(request, { db: env.DB });
	} catch (error) {
		return serverError(error);
	}
}
