import path from "node:path";
import { loadPosts } from "../src/lib/content/posts";
import { writePublishedPostManifest, writeStaticMetadata } from "../src/lib/static-metadata";

const posts = loadPosts({ includeDrafts: false });
writeStaticMetadata(posts, path.join(process.cwd(), "public"));
writePublishedPostManifest(posts, path.join(process.cwd(), "src", "generated", "published-post-slugs.json"));

console.log(`Generated RSS, sitemap, and robots files from ${posts.length} published post${posts.length === 1 ? "" : "s"}.`);
