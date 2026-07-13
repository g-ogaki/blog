import path from "node:path";
import { loadPosts } from "../src/lib/content/posts";
import { writeStaticMetadata } from "../src/lib/static-metadata";

const posts = loadPosts({ includeDrafts: false });
writeStaticMetadata(posts, path.join(process.cwd(), "public"));

console.log(`Generated RSS, sitemap, and robots files from ${posts.length} published post${posts.length === 1 ? "" : "s"}.`);
