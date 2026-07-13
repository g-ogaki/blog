interface TaxonomyPost {
	metadata: {
		category: string;
		date: string;
		tags: readonly string[];
	};
}

function uniqueSorted(values: Iterable<string>, descending = false) {
	return [...new Set(values)].sort((left, right) =>
		descending ? right.localeCompare(left) : left.localeCompare(right, "ja"),
	);
}

export function latestPosts<T>(posts: readonly T[], limit = 5) {
	return posts.slice(0, limit);
}

export function buildTaxonomy(posts: readonly TaxonomyPost[]) {
	return {
		categories: uniqueSorted(posts.map((post) => post.metadata.category)),
		months: uniqueSorted(posts.map((post) => post.metadata.date.slice(0, 7)), true),
		tags: uniqueSorted(posts.flatMap((post) => [...post.metadata.tags])),
		years: uniqueSorted(posts.map((post) => post.metadata.date.slice(0, 4)), true),
	};
}

export type Taxonomy = ReturnType<typeof buildTaxonomy>;
