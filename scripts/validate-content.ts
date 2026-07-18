import { loadPosts } from "../src/lib/content/posts";
import { collectShikiLanguages } from "./shiki-languages";

const posts = loadPosts({ includeDrafts: false });
collectShikiLanguages(posts);

console.log(`Validated ${posts.length} published post${posts.length === 1 ? "" : "s"}.`);
