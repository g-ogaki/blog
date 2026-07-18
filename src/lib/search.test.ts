import { describe, expect, it } from "vitest";
import { parseSearchState, toggleSearchFilter, toPagefindFilters, toSearchParams } from "./search";

describe("search URL state", () => {
	it("keeps supported query and filter values in the canonical URL contract", () => {
		const state = parseSearchState(new URLSearchParams("q=static&category=Programming&tag=&unknown=value"));

		expect(state).toEqual({ query: "static", filters: { category: "Programming" } });
		expect(toPagefindFilters(state.filters)).toEqual({ category: "Programming" });
		expect(toSearchParams(state.query, state.filters).toString()).toBe("q=static&category=Programming");
	});

	it("preserves repeated tags and sends them to Pagefind with AND semantics", () => {
		const state = parseSearchState(new URLSearchParams("q=static&tag=typescript&tag=&tag=learning&tag=typescript"));

		expect(state).toEqual({ query: "static", filters: { tag: ["typescript", "learning"] } });
		expect(toPagefindFilters(state.filters)).toEqual({ tag: ["typescript", "learning"] });
		expect(toSearchParams(state.query, state.filters).toString()).toBe("q=static&tag=typescript&tag=learning");
	});

	it("toggles tags independently while scalar and date filters remain exclusive", () => {
		const withTags = toggleSearchFilter({ category: "Programming", year: "2026" }, "tag", "typescript");
		const withTwoTags = toggleSearchFilter(withTags, "tag", "learning");

		expect(withTwoTags).toEqual({ category: "Programming", year: "2026", tag: ["typescript", "learning"] });
		expect(toggleSearchFilter(withTwoTags, "tag", "typescript")).toEqual({
			category: "Programming",
			year: "2026",
			tag: ["learning"],
		});
		expect(toggleSearchFilter(withTwoTags, "month", "2026-05")).toEqual({
			category: "Programming",
			month: "2026-05",
			tag: ["typescript", "learning"],
			year: undefined,
		});
	});
});
