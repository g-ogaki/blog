import { getCloudflareContext } from "@opennextjs/cloudflare";
import publishedPostSlugs from "@/generated/published-post-slugs.json";
import { handleGetComments, handlePostComment, type CommentApiDependencies } from "@/lib/comments/api";

export const dynamic = "force-dynamic";

type CommentEnvironment = CloudflareEnv & {
	IP_HASH_SECRET?: string;
	TURNSTILE_SECRET_KEY?: string;
};

const publishedPosts = new Set<string>(publishedPostSlugs);

async function getDependencies(): Promise<CommentApiDependencies> {
	const { env } = await getCloudflareContext({ async: true });
	const commentEnv = env as CommentEnvironment;
	const ipHashSecret = commentEnv.IP_HASH_SECRET ?? process.env.IP_HASH_SECRET;
	const turnstileSecretKey = commentEnv.TURNSTILE_SECRET_KEY ?? process.env.TURNSTILE_SECRET_KEY;
	if (!commentEnv.DB || !ipHashSecret || !turnstileSecretKey) {
		throw new Error("Comment API bindings are not configured");
	}

	return {
		db: commentEnv.DB,
		ipHashSecret,
		isPublishedPost: (slug) => publishedPosts.has(slug),
		turnstileSecretKey,
	};
}

function serverError(error: unknown) {
	console.error("Comment API operation failed", error instanceof Error ? error.name : "UnknownError");
	return Response.json({ success: false, error: "Comment service is unavailable." }, { status: 500 });
}

export async function POST(request: Request) {
	try {
		return await handlePostComment(request, await getDependencies());
	} catch (error) {
		return serverError(error);
	}
}

export async function GET(request: Request) {
	try {
		return await handleGetComments(request, await getDependencies());
	} catch (error) {
		return serverError(error);
	}
}
