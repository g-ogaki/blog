import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadPosts, validateUniquePostUrls } from "./posts";

const temporaryDirectories: string[] = [];

function createContentDirectory() {
	const directory = mkdtempSync(path.join(tmpdir(), "monipy-content-"));
	temporaryDirectories.push(directory);
	return directory;
}

function writePost(
	contentDirectory: string,
	postDirectory: string,
	frontmatter: string,
	content = "Synthetic article content.\n",
) {
	const directory = path.join(contentDirectory, postDirectory);
	mkdirSync(directory, { recursive: true });
	writeFileSync(path.join(directory, "index.md"), `---\n${frontmatter}\n---\n\n${content}`);
	return directory;
}

function validFrontmatter(
	options: { date?: string; draft?: boolean; image?: string } = {},
) {
	return `title: Synthetic post
date: ${options.date ?? "2026-05-03"}
category: Programming
tags:
  - typescript
  - learning
draft: ${options.draft ?? false}${options.image ? `\nimage: ${options.image}` : ""}`;
}

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, { force: true, recursive: true });
	}
});

describe("loadPosts", () => {
	it("loads typed metadata and derives the canonical post path", () => {
		const contentDirectory = createContentDirectory();
		writePost(contentDirectory, "2026/20260503-learning-typescript", validFrontmatter());

		const [post] = loadPosts({ contentDirectory, includeDrafts: false });

		expect(post).toMatchObject({
			description: "Synthetic article content.",
			year: "2026",
			directoryName: "20260503-learning-typescript",
			slug: "2026/20260503-learning-typescript",
			url: "/blog/2026/20260503-learning-typescript",
			metadata: {
				title: "Synthetic post",
				date: "2026-05-03",
				category: "Programming",
				tags: ["typescript", "learning"],
				draft: false,
			},
		});
	});

	it("sorts newest first and excludes drafts when requested", () => {
		const contentDirectory = createContentDirectory();
		writePost(contentDirectory, "2026/20260503-published", validFrontmatter());
		writePost(
			contentDirectory,
			"2026/20260504-draft",
			validFrontmatter({ date: "2026-05-04", draft: true }),
		);

		expect(loadPosts({ contentDirectory, includeDrafts: false }).map((post) => post.url)).toEqual([
			"/blog/2026/20260503-published",
		]);
		expect(loadPosts({ contentDirectory, includeDrafts: true }).map((post) => post.url)).toEqual([
			"/blog/2026/20260504-draft",
			"/blog/2026/20260503-published",
		]);
		expect(loadPosts({ contentDirectory, includeDrafts: true })[0].description).toBe("Synthetic article content.");
	});

	it("validates draft assets even when drafts are excluded", () => {
		const contentDirectory = createContentDirectory();
		writePost(
			contentDirectory,
			"2026/20260503-draft",
			validFrontmatter({ draft: true }),
			"![Missing](missing.png)\n",
		);

		expect(() => loadPosts({ contentDirectory, includeDrafts: false })).toThrow(/missing\.png.*does not exist/s);
	});

	it("rejects published links to draft-only post URLs in production", () => {
		const contentDirectory = createContentDirectory();
		writePost(
			contentDirectory,
			"2026/20260503-published",
			validFrontmatter(),
			"[Draft](/blog/2026/20260504-draft)\n",
		);
		writePost(
			contentDirectory,
			"2026/20260504-draft",
			validFrontmatter({ date: "2026-05-04", draft: true }),
		);

		expect(() => loadPosts({ contentDirectory, includeDrafts: false })).toThrow(/draft.*does not identify a post/s);
	});

	it("reports missing required frontmatter with the source path", () => {
		const contentDirectory = createContentDirectory();
		writePost(
			contentDirectory,
			"2026/20260503-invalid",
			validFrontmatter().replace("title: Synthetic post\n", ""),
		);

		expect(() => loadPosts({ contentDirectory })).toThrow(/20260503-invalid\/index\.md.*title/s);
	});

	it("rejects the obsolete summary frontmatter field", () => {
		const contentDirectory = createContentDirectory();
		writePost(
			contentDirectory,
			"2026/20260503-invalid",
			`${validFrontmatter()}\nsummary: Obsolete summary.`,
		);

		expect(() => loadPosts({ contentDirectory })).toThrow(/20260503-invalid\/index\.md.*Unrecognized key.*summary/s);
	});

	it("rejects invalid dates and directory dates that disagree with frontmatter", () => {
		const invalidDateDirectory = createContentDirectory();
		writePost(
			invalidDateDirectory,
			"2026/20260230-invalid-date",
			validFrontmatter({ date: "2026-02-30" }),
		);
		expect(() => loadPosts({ contentDirectory: invalidDateDirectory })).toThrow(/valid calendar date/);

		const mismatchedDirectory = createContentDirectory();
		writePost(mismatchedDirectory, "2026/20260504-mismatch", validFrontmatter());
		expect(() => loadPosts({ contentDirectory: mismatchedDirectory })).toThrow(/must match frontmatter date/);
	});

	it("rejects malformed post directory names", () => {
		const contentDirectory = createContentDirectory();
		writePost(contentDirectory, "2026/learning-typescript", validFrontmatter());

		expect(() => loadPosts({ contentDirectory })).toThrow(/YYYYMMDD-slug/);
	});

	it("validates frontmatter and Markdown image files", () => {
		const frontmatterImageDirectory = createContentDirectory();
		writePost(
			frontmatterImageDirectory,
			"2026/20260503-missing-cover",
			validFrontmatter({ image: "cover.png" }),
		);
		expect(() => loadPosts({ contentDirectory: frontmatterImageDirectory })).toThrow(/cover\.png.*does not exist/s);

		const markdownImageDirectory = createContentDirectory();
		writePost(
			markdownImageDirectory,
			"2026/20260503-missing-diagram",
			validFrontmatter(),
			"![Diagram](diagram.png)\n",
		);
		expect(() => loadPosts({ contentDirectory: markdownImageDirectory })).toThrow(/diagram\.png.*does not exist/s);

		const rootImageDirectory = createContentDirectory();
		writePost(
			rootImageDirectory,
			"2026/20260503-root-image",
			validFrontmatter(),
			"![Root image](/missing.png)\n",
		);
		expect(() => loadPosts({ contentDirectory: rootImageDirectory })).toThrow(/must reference a file colocated/s);
	});

	it("validates relative files and internal blog links", () => {
		const contentDirectory = createContentDirectory();
		const postDirectory = writePost(
			contentDirectory,
			"2026/20260503-valid-links",
			validFrontmatter(),
			"[Notes](notes.txt)\n\n[Missing post](/blog/2026/20260504-missing)\n",
		);
		writeFileSync(path.join(postDirectory, "notes.txt"), "notes");

		expect(() => loadPosts({ contentDirectory })).toThrow(/20260504-missing.*does not identify a post/s);
	});

	it("allows existing post links, external links, and fragments", () => {
		const contentDirectory = createContentDirectory();
		writePost(
			contentDirectory,
			"2026/20260503-first",
			validFrontmatter(),
			"[Second](/blog/2026/20260504-second)\n\n[External](https://example.com)\n\n[Section](#section)\n",
		);
		writePost(
			contentDirectory,
			"2026/20260504-second",
			validFrontmatter({ date: "2026-05-04" }),
		);

		expect(loadPosts({ contentDirectory, includeDrafts: false })).toHaveLength(2);
	});

	it("validates raw article HTML with the source path", () => {
		const unsafeDirectory = createContentDirectory();
		writePost(
			unsafeDirectory,
			"2026/20260503-unsafe-html",
			validFrontmatter(),
			'<details><summary>More</summary><script>alert("xss")</script></details>',
		);
		expect(() => loadPosts({ contentDirectory: unsafeDirectory })).toThrow(
			/20260503-unsafe-html\/index\.md.*<script> is not allowed/s,
		);

		const imageDirectory = createContentDirectory();
		writePost(
			imageDirectory,
			"2026/20260503-raw-image",
			validFrontmatter(),
			'<img src="missing.png" alt="Missing">',
		);
		expect(() => loadPosts({ contentDirectory: imageDirectory })).toThrow(
			/raw HTML image.*missing\.png.*does not exist/s,
		);
	});
});

describe("validateUniquePostUrls", () => {
	it("rejects case-insensitive duplicate canonical URLs", () => {
		const createPost = (url: string, sourcePath: string) => ({ url, sourcePath });

		expect(() =>
			validateUniquePostUrls([
				createPost("/blog/2026/20260503-post", "/first/index.md"),
				createPost("/blog/2026/20260503-POST", "/second/index.md"),
			]),
		).toThrow(/duplicate post URL.*first.*second/s);
	});
});
