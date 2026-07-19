import { publishPostAssets } from "../src/lib/content/assets";
import { loadPosts } from "../src/lib/content/posts";

const includeDrafts = process.argv.includes("--include-drafts");
publishPostAssets(loadPosts({ includeDrafts, locale: "all" }));
