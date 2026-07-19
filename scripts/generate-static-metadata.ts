import path from "node:path";
import { loadPosts } from "../src/lib/content/posts";
import { writePublishedPostManifest, writeStaticMetadata } from "../src/lib/static-metadata";

const posts = loadPosts({ includeDrafts: false, locale: "all" });
writeStaticMetadata(posts, path.join(process.cwd(), "public"));
writePublishedPostManifest(posts, path.join(process.cwd(), "src", "generated", "published-posts.json"));

console.log(`Generated RSS, sitemap, robots, and the article manifest from ${posts.length} published translation${posts.length === 1 ? "" : "s"}.`);
