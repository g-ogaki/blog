export const searchFilterKeys = ["category", "tag", "year", "month"] as const;

export type SearchFilterKey = (typeof searchFilterKeys)[number];
export type SearchFilters = Partial<Record<SearchFilterKey, string>>;

export function parseSearchState(searchParams: URLSearchParams) {
	const filters: SearchFilters = {};
	for (const key of searchFilterKeys) {
		const value = searchParams.get(key)?.trim();
		if (value) filters[key] = value;
	}

	return { filters, query: searchParams.get("q")?.trim() ?? "" };
}

export function hasSearchCriteria(query: string, filters: SearchFilters) {
	return Boolean(query.trim() || searchFilterKeys.some((key) => filters[key]));
}

export function toSearchParams(query: string, filters: SearchFilters) {
	const searchParams = new URLSearchParams();
	if (query.trim()) searchParams.set("q", query.trim());
	for (const key of searchFilterKeys) {
		if (filters[key]) searchParams.set(key, filters[key]);
	}
	return searchParams;
}

export function toPagefindFilters(filters: SearchFilters) {
	const pagefindFilters: Record<string, string> = {};
	for (const key of searchFilterKeys) {
		if (filters[key]) pagefindFilters[key] = filters[key];
	}
	return pagefindFilters;
}
