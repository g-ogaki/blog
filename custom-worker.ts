// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore OpenNext generates this module before Wrangler bundles the custom entrypoint.
import handler, { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
import publishedPosts from "./src/generated/published-posts.json";
import { cleanupExpiredCommentData } from "./src/lib/comments/cleanup";

export default {
	fetch: handler.fetch,

	async scheduled(event, env) {
		const result = await cleanupExpiredCommentData(env.DB, {
			now: new Date(event.scheduledTime),
			publishedPostSlugs: publishedPosts.map((post) => post.slug),
		});
		console.info("Comment retention cleanup completed", result);
	},
} satisfies ExportedHandler<CloudflareEnv>;

export { DOQueueHandler, DOShardedTagCache };
