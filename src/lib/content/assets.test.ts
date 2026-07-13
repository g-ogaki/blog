import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { Post } from "./posts";
import { publishPostAssets } from "./assets";

const temporaryDirectories: string[] = [];

function createTemporaryDirectory(prefix: string) {
	const directory = mkdtempSync(path.join(tmpdir(), prefix));
	temporaryDirectories.push(directory);
	return directory;
}

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, { force: true, recursive: true });
	}
});

describe("publishPostAssets", () => {
	it("copies colocated assets to a deterministic public path and excludes Markdown", () => {
		const postDirectory = createTemporaryDirectory("monipy-post-");
		const publicDirectory = createTemporaryDirectory("monipy-public-");
		mkdirSync(path.join(postDirectory, "images"));
		mkdirSync(path.join(postDirectory, "notes"));
		writeFileSync(path.join(postDirectory, "index.md"), "# Post");
		writeFileSync(path.join(postDirectory, "cover.png"), "cover");
		writeFileSync(path.join(postDirectory, "images", "diagram.svg"), "<svg />");
		writeFileSync(path.join(postDirectory, "notes", "index.md"), "nested notes");
		const post = {
			slug: "2026/20260503-learning-typescript",
			sourcePath: path.join(postDirectory, "index.md"),
		} as Post;

		publishPostAssets([post], publicDirectory);

		const destination = path.join(
			publicDirectory,
			"post-assets",
			"2026",
			"20260503-learning-typescript",
		);
		expect(readFileSync(path.join(destination, "cover.png"), "utf8")).toBe("cover");
		expect(readFileSync(path.join(destination, "images", "diagram.svg"), "utf8")).toBe("<svg />");
		expect(readFileSync(path.join(destination, "notes", "index.md"), "utf8")).toBe("nested notes");
		expect(existsSync(path.join(destination, "index.md"))).toBe(false);
	});

	it("removes stale published assets before copying", () => {
		const postDirectory = createTemporaryDirectory("monipy-post-");
		const publicDirectory = createTemporaryDirectory("monipy-public-");
		writeFileSync(path.join(postDirectory, "index.md"), "# Post");
		const staleDirectory = path.join(publicDirectory, "post-assets", "stale");
		mkdirSync(staleDirectory, { recursive: true });
		writeFileSync(path.join(staleDirectory, "old.png"), "old");
		const post = {
			slug: "2026/20260503-no-assets",
			sourcePath: path.join(postDirectory, "index.md"),
		} as Post;

		publishPostAssets([post], publicDirectory);

		expect(existsSync(staleDirectory)).toBe(false);
	});
});
