import { writeFileSync } from "node:fs";
import path from "node:path";
import { loadPosts } from "../src/lib/content/posts";
import { collectShikiLanguages, renderShikiLanguageRegistry } from "./shiki-languages";

const includeDrafts = process.argv.includes("--include-drafts");
const posts = loadPosts({ includeDrafts, locale: "all" });
const registryPath = path.join(process.cwd(), "src", "generated", "shiki-languages.ts");

writeFileSync(registryPath, renderShikiLanguageRegistry(posts));

const { languages } = collectShikiLanguages(posts);
console.log(`Generated Shiki registry for ${languages.length} language${languages.length === 1 ? "" : "s"}: ${languages.join(", ") || "none"}.`);
