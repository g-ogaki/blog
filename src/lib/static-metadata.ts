import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Post } from "@/lib/content/posts";
import { buildRobotsText, buildRssFeed, buildSitemapXml } from "@/lib/syndication";

export function writeStaticMetadata(posts: readonly Post[], outputDirectory: string) {
	mkdirSync(outputDirectory, { recursive: true });
	writeFileSync(path.join(outputDirectory, "rss.xml"), buildRssFeed(posts, "ja"));
	mkdirSync(path.join(outputDirectory, "en"), { recursive: true });
	writeFileSync(path.join(outputDirectory, "en", "rss.xml"), buildRssFeed(posts, "en"));
	writeFileSync(path.join(outputDirectory, "sitemap.xml"), buildSitemapXml(posts));
	writeFileSync(path.join(outputDirectory, "robots.txt"), buildRobotsText());
}

export function writePublishedPostManifest(posts: readonly Post[], outputPath: string) {
	mkdirSync(path.dirname(outputPath), { recursive: true });
	const articles = new Map<string, { slug: string; translations: Record<string, { title: string; url: string }> }>();
	for (const post of posts.filter((post) => !post.metadata.draft)) {
		const article = articles.get(post.slug) ?? { slug: post.slug, translations: {} };
		article.translations[post.locale] = { title: post.metadata.title, url: post.url };
		articles.set(post.slug, article);
	}
	const manifest = [...articles.values()];
	writeFileSync(outputPath, `${JSON.stringify(manifest, null, "\t")}\n`);
}
