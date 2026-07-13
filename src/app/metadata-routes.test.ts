import { describe, expect, it } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("metadata routes", () => {
	it("publishes canonical sitemap entries without drafts", () => {
		const entries = sitemap();

		expect(entries.map((entry) => entry.url)).toContain(
			"https://monipy.org/blog/2026/20260503-learning-typescript",
		);
		expect(entries.map((entry) => entry.url)).not.toContain(
			"https://monipy.org/blog/2026/20260515-rust-notes",
		);
	});

	it("allows crawling and advertises the canonical sitemap", () => {
		expect(robots()).toEqual({
			rules: { userAgent: "*", allow: "/" },
			sitemap: "https://monipy.org/sitemap.xml",
			host: "https://monipy.org",
		});
	});
});
