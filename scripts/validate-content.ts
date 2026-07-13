import { loadPosts } from "../src/lib/content/posts";

const posts = loadPosts({ includeDrafts: false });

console.log(`Validated ${posts.length} published post${posts.length === 1 ? "" : "s"}.`);
