export const searchFilterKeys = ["category", "tag", "year", "month"] as const;

export type SearchFilterKey = (typeof searchFilterKeys)[number];
type ScalarSearchFilterKey = Exclude<SearchFilterKey, "tag">;
export type SearchFilters = Partial<Record<ScalarSearchFilterKey, string>> & { tag?: string[] };

export function parseSearchState(searchParams: URLSearchParams) {
	const filters: SearchFilters = {};
	for (const key of ["category", "year", "month"] as const) {
		const value = searchParams.get(key)?.trim();
		if (value) filters[key] = value;
	}
	const tags = [...new Set(searchParams.getAll("tag").map((tag) => tag.trim()).filter(Boolean))];
	if (tags.length) filters.tag = tags;

	return { filters, query: searchParams.get("q")?.trim() ?? "" };
}

export function hasSearchCriteria(query: string, filters: SearchFilters) {
	return Boolean(query.trim() || filters.category || filters.tag?.length || filters.year || filters.month);
}

export function toSearchParams(query: string, filters: SearchFilters) {
	const searchParams = new URLSearchParams();
	if (query.trim()) searchParams.set("q", query.trim());
	if (filters.category) searchParams.set("category", filters.category);
	for (const tag of filters.tag ?? []) searchParams.append("tag", tag);
	if (filters.year) searchParams.set("year", filters.year);
	if (filters.month) searchParams.set("month", filters.month);
	return searchParams;
}

export function toPagefindFilters(filters: SearchFilters) {
	const pagefindFilters: Record<string, string | string[]> = {};
	if (filters.category) pagefindFilters.category = filters.category;
	if (filters.tag?.length) pagefindFilters.tag = [...filters.tag];
	if (filters.year) pagefindFilters.year = filters.year;
	if (filters.month) pagefindFilters.month = filters.month;
	return pagefindFilters;
}

export function isSearchFilterSelected(filters: SearchFilters, key: SearchFilterKey, value: string) {
	return key === "tag" ? filters.tag?.includes(value) ?? false : filters[key] === value;
}

export function toggleSearchFilter(filters: SearchFilters, key: SearchFilterKey, value: string): SearchFilters {
	if (key === "tag") {
		const selectedTags = filters.tag ?? [];
		const tags = selectedTags.includes(value)
			? selectedTags.filter((tag) => tag !== value)
			: [...selectedTags, value];
		return { ...filters, tag: tags.length ? tags : undefined };
	}

	const nextFilters: SearchFilters = { ...filters, [key]: filters[key] === value ? undefined : value };
	if (key === "year") nextFilters.month = undefined;
	if (key === "month") nextFilters.year = undefined;
	return nextFilters;
}
