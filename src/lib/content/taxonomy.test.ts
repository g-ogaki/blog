import { describe, expect, it } from "vitest";
import { buildTaxonomy, latestPosts } from "./taxonomy";

const posts = Array.from({ length: 6 }, (_, index) => ({
	metadata: {
		category: index % 2 === 0 ? "Programming" : "日記",
		date: `2026-0${6 - index}-01`,
		tags: index === 0 ? ["typescript", "learning"] : ["learning"],
	},
	url: `/blog/post-${index}`,
}));

describe("latestPosts", () => {
	it("limits the homepage collection to five posts", () => {
		expect(latestPosts(posts)).toEqual(posts.slice(0, 5));
	});
});

describe("buildTaxonomy", () => {
	it("deduplicates and sorts categories, tags, years, and months", () => {
		expect(buildTaxonomy(posts)).toEqual({
		categories: ["Programming", "日記"],
		months: ["2026-06", "2026-05", "2026-04", "2026-03", "2026-02", "2026-01"],
		tags: ["learning", "typescript"],
		years: ["2026"],
	});
	});
});
