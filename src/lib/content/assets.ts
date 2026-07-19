import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import type { Post } from "./posts";

function copyAssets(sourceDirectory: string, destinationDirectory: string, articleDirectory: string) {
	for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
		const sourcePath = path.join(sourceDirectory, entry.name);
		if (sourceDirectory === articleDirectory && entry.isFile() && (entry.name === "index.md" || entry.name === "index.en.md")) {
			continue;
		}

		const destinationPath = path.join(destinationDirectory, entry.name);
		if (entry.isDirectory()) {
			copyAssets(sourcePath, destinationPath, articleDirectory);
		} else if (entry.isFile()) {
			mkdirSync(destinationDirectory, { recursive: true });
			copyFileSync(sourcePath, destinationPath);
		}
	}
}

export function publishPostAssets(posts: readonly Post[], publicDirectory = path.join(process.cwd(), "public")) {
	const assetRoot = path.join(publicDirectory, "post-assets");
	rmSync(assetRoot, { force: true, recursive: true });

	for (const post of new Map(posts.map((post) => [post.slug, post])).values()) {
		const articleDirectory = path.dirname(post.sourcePath);
		copyAssets(articleDirectory, path.join(assetRoot, post.slug), articleDirectory);
	}
}
