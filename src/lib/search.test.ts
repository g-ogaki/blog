import { describe, expect, it } from "vitest";
import { parseSearchState, toPagefindFilters, toSearchParams } from "./search";

describe("search URL state", () => {
	it("keeps supported query and filter values in the canonical URL contract", () => {
		const state = parseSearchState(new URLSearchParams("q=static&category=Programming&tag=&unknown=value"));

		expect(state).toEqual({ query: "static", filters: { category: "Programming" } });
		expect(toPagefindFilters(state.filters)).toEqual({ category: "Programming" });
		expect(toSearchParams(state.query, state.filters).toString()).toBe("q=static&category=Programming");
	});
});
