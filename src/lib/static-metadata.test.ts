import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { Post } from "@/lib/content/posts";
import { writeStaticMetadata } from "./static-metadata";

const temporaryDirectories: string[] = [];

function post(title: string, draft: boolean): Post {
	return {
		content: "Synthetic content.",
		directoryName: "20260503-synthetic",
		metadata: {
			title,
			date: "2026-05-03",
			category: "Testing",
			tags: ["synthetic"],
			summary: "Synthetic summary.",
			draft,
		},
		slug: "2026/20260503-synthetic",
		sourcePath: "/content/posts/2026/20260503-synthetic/index.md",
		url: "/blog/2026/20260503-synthetic",
		year: "2026",
	};
}

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, { force: true, recursive: true });
	}
});

describe("writeStaticMetadata", () => {
	it("writes RSS, sitemap, and robots files containing published posts only", () => {
		const outputDirectory = mkdtempSync(path.join(tmpdir(), "monipy-metadata-"));
		temporaryDirectories.push(outputDirectory);

		writeStaticMetadata([post("Published post", false), post("Hidden draft", true)], outputDirectory);

		const rss = readFileSync(path.join(outputDirectory, "rss.xml"), "utf8");
		const sitemap = readFileSync(path.join(outputDirectory, "sitemap.xml"), "utf8");
		const robots = readFileSync(path.join(outputDirectory, "robots.txt"), "utf8");
		expect(rss).toContain("Published post");
		expect(rss).not.toContain("Hidden draft");
		expect(sitemap).toContain("https://monipy.org/blog/2026/20260503-synthetic");
		expect(robots).toContain("Sitemap: https://monipy.org/sitemap.xml");
	});
});
