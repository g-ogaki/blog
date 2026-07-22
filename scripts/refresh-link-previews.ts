import { readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadLinkPreview } from "../src/lib/content/link-preview";
import {
	refreshLinkPreviewManifest,
	serializeLinkPreviewManifest,
} from "../src/lib/content/link-preview-manifest";
import { loadPosts } from "../src/lib/content/posts";

async function main() {
	const manifestPath = path.join(process.cwd(), "src", "generated", "link-previews.json");
	const temporaryPath = path.join(path.dirname(manifestPath), `.${path.basename(manifestPath)}.${process.pid}.tmp`);
	const existing = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;
	const posts = loadPosts({ includeDrafts: false, locale: "all" });
	const result = await refreshLinkPreviewManifest(posts, existing, loadLinkPreview);
	try {
		writeFileSync(temporaryPath, serializeLinkPreviewManifest(result.manifest));
		renameSync(temporaryPath, manifestPath);
	} finally {
		rmSync(temporaryPath, { force: true });
	}

	console.log(
		`Refreshed ${result.refreshed.length} link preview${result.refreshed.length === 1 ? "" : "s"}`
		+ (result.retained.length > 0 ? ` and retained ${result.retained.length} cached preview${result.retained.length === 1 ? "" : "s"}` : "")
		+ ".",
	);
}

main().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
