import { loadPosts } from "@/lib/content/posts";
import { buildRssFeed } from "@/lib/syndication";

export const dynamic = "force-static";

export function GET() {
	const posts = loadPosts({ includeDrafts: false });
	return new Response(buildRssFeed(posts), {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}
