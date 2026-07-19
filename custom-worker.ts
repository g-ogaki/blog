// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore OpenNext generates this module before Wrangler bundles the custom entrypoint.
import handler, { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
import publishedPosts from "./src/generated/published-posts.json";
import { cleanupExpiredCommentData } from "./src/lib/comments/cleanup";
import { preferredLocale } from "./src/lib/locale-routing";

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (request.method === "GET" && url.pathname === "/" && preferredLocale(request.headers.get("cookie"), request.headers.get("accept-language")) === "en") {
			url.pathname = "/en";
			const headers = new Headers({
				"cache-control": "private, no-store",
				location: url.toString(),
				vary: "Cookie, Accept-Language",
			});
			return new Response(null, { status: 307, headers });
		}
		return handler.fetch(request, env, ctx);
	},

	async scheduled(event, env) {
		const result = await cleanupExpiredCommentData(env.DB, {
			now: new Date(event.scheduledTime),
			publishedPostSlugs: publishedPosts.map((post) => post.slug),
		});
		console.info("Comment retention cleanup completed", result);
	},
} satisfies ExportedHandler<CloudflareEnv>;

export { DOQueueHandler, DOShardedTagCache };
