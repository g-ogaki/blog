import { getCloudflareContext } from "@opennextjs/cloudflare";
import publishedPostManifest from "@/generated/published-posts.json";
import {
	handleGetComments,
	handlePostComment,
	type CommentApiDependencies,
	type CommentReadDependencies,
} from "@/lib/comments/api";
import { absoluteUrl } from "@/lib/site";
import type { Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type CommentEnvironment = CloudflareEnv & {
	DISCORD_WEBHOOK_URL?: string;
	IP_HASH_SECRET?: string;
	TURNSTILE_SECRET_KEY?: string;
};

const publishedPosts = new Map(publishedPostManifest.map((post) => [post.slug, post]));

function findPublishedPost(slug: string, locale: Locale) {
	const translation = publishedPosts.get(slug)?.translations[locale];
	return translation ? { slug, ...translation, url: absoluteUrl(translation.url) } : undefined;
}

async function getReadDependencies(): Promise<CommentReadDependencies> {
	const { env } = await getCloudflareContext({ async: true });
	if (!env.DB) throw new Error("D1 database binding is not configured");
	return { db: env.DB, findPublishedPost };
}

async function getDependencies(): Promise<CommentApiDependencies> {
	const { env } = await getCloudflareContext({ async: true });
	const commentEnv = env as CommentEnvironment;
	const discordWebhookUrl = commentEnv.DISCORD_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
	const ipHashSecret = commentEnv.IP_HASH_SECRET ?? process.env.IP_HASH_SECRET;
	const turnstileSecretKey = commentEnv.TURNSTILE_SECRET_KEY ?? process.env.TURNSTILE_SECRET_KEY;
	if (!commentEnv.DB || !discordWebhookUrl || !ipHashSecret || !turnstileSecretKey) {
		throw new Error("Comment API bindings are not configured");
	}

	return {
		db: commentEnv.DB,
		discordWebhookUrl,
		findPublishedPost,
		ipHashSecret,
		moderationUrl: absoluteUrl("/comments/moderate"),
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
		return await handleGetComments(request, await getReadDependencies());
	} catch (error) {
		return serverError(error);
	}
}
