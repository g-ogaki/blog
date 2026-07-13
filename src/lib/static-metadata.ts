import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Post } from "@/lib/content/posts";
import { buildRobotsText, buildRssFeed, buildSitemapXml } from "@/lib/syndication";

export function writeStaticMetadata(posts: readonly Post[], outputDirectory: string) {
	mkdirSync(outputDirectory, { recursive: true });
	writeFileSync(path.join(outputDirectory, "rss.xml"), buildRssFeed(posts));
	writeFileSync(path.join(outputDirectory, "sitemap.xml"), buildSitemapXml(posts));
	writeFileSync(path.join(outputDirectory, "robots.txt"), buildRobotsText());
}
