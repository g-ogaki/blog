import { loadPosts } from "../src/lib/content/posts";
import { collectShikiLanguages } from "./shiki-languages";

const posts = loadPosts({ includeDrafts: false, locale: "all" });
collectShikiLanguages(posts);

console.log(`Validated ${posts.length} published translation${posts.length === 1 ? "" : "s"}.`);
