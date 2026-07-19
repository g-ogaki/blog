import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/content/posts";
import { buildRssFeed, buildSitemap } from "./syndication";

function post(overrides: Partial<Post["metadata"]> = {}): Post {
	return {
		content: "Synthetic content.",
		description: "Types < scripts > notes",
		directoryName: "20260503-learning-typescript",
		locale: "ja",
		metadata: {
			title: "TypeScript & XML",
			date: "2026-05-03",
			category: "Programming",
			tags: ["typescript"],
			draft: false,
			...overrides,
		},
		slug: "2026/20260503-learning-typescript",
		sourcePath: "/content/posts/2026/20260503-learning-typescript/index.md",
		url: "/blog/2026/20260503-learning-typescript",
		year: "2026",
	};
}

describe("buildRssFeed", () => {
	it("emits canonical published entries with escaped XML and JST dates", () => {
		const feed = buildRssFeed([post()]);

		expect(feed).toContain("<link>https://monipy.org/blog/2026/20260503-learning-typescript</link>");
		expect(feed).toContain("<title>TypeScript &amp; XML</title>");
		expect(feed).toContain("<description>Types &lt; scripts &gt; notes</description>");
		expect(feed).toContain("<pubDate>Sat, 02 May 2026 15:00:00 GMT</pubDate>");
	});

	it("never emits draft entries", () => {
		const feed = buildRssFeed([post(), post({ title: "Hidden draft", draft: true })]);

		expect(feed).not.toContain("Hidden draft");
	});

	it("emits only the requested locale in each feed", () => {
		const englishPost = {
			...post(),
			locale: "en" as const,
			url: "/en/blog/2026/20260503-learning-typescript",
			metadata: { ...post().metadata, title: "Getting Started with TypeScript" },
		};
		const feed = buildRssFeed([post(), englishPost], "en");
		expect(feed).toContain("<language>en</language>");
		expect(feed).toContain("https://monipy.org/en/blog/2026/20260503-learning-typescript");
		expect(feed).not.toContain("TypeScript &amp; XML");
	});
});

describe("buildSitemap", () => {
	it("includes canonical site and published post URLs while excluding drafts", () => {
		const entries = buildSitemap([post(), post({ title: "Hidden draft", draft: true })]);

		expect(entries.map((entry) => entry.url)).toEqual([
			"https://monipy.org",
			"https://monipy.org/en",
			"https://monipy.org/blog",
			"https://monipy.org/en/blog",
			"https://monipy.org/blog/2026/20260503-learning-typescript",
		]);
		expect(entries[0].alternates).toContainEqual({ hreflang: "en", href: "https://monipy.org/en" });
	});
});
