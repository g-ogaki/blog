import generatedLinkPreviews from "../src/generated/link-previews.json";
import { validateLinkPreviewManifest } from "../src/lib/content/link-preview-manifest";
import { loadPosts } from "../src/lib/content/posts";
import { collectShikiLanguages } from "./shiki-languages";

const posts = loadPosts({ includeDrafts: false, locale: "all" });
collectShikiLanguages(posts);
validateLinkPreviewManifest(posts, generatedLinkPreviews);

console.log(`Validated ${posts.length} published translation${posts.length === 1 ? "" : "s"}.`);
