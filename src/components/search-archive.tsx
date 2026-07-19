"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PostList, type PostListPost } from "@/components/post-list";
import { loadPagefind, type PagefindApi, type PagefindResultData } from "@/lib/pagefind-client";
import type { Taxonomy } from "@/lib/content/taxonomy";
import {
	hasSearchCriteria,
	isSearchFilterSelected,
	parseSearchState,
	toggleSearchFilter,
	toPagefindFilters,
	toSearchParams,
	type SearchFilterKey,
	type SearchFilters,
} from "@/lib/search";

interface SearchArchiveProps {
	posts: readonly PostListPost[];
	taxonomy: Taxonomy;
}

type SearchStatus = "loading" | "ready" | "searching" | "unavailable";
const POST_BATCH_SIZE = 2;
const subscribeToHydration = () => () => {};

function SearchIcon() {
	return <svg aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 stroke-text-muted" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

export function SearchArchive({ posts, taxonomy }: SearchArchiveProps) {
	const [pagefind, setPagefind] = useState<PagefindApi>();
	const [query, setQuery] = useState("");
	const [filters, setFilters] = useState<SearchFilters>({});
	const [results, setResults] = useState<PagefindResultData[] | null>(null);
	const [status, setStatus] = useState<SearchStatus>("loading");
	const [visibleLimit, setVisibleLimit] = useState(POST_BATCH_SIZE);
	const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
	const deferredQuery = useDeferredValue(query);
	const disclosureRef = useRef<HTMLDetailsElement>(null);
	const mobileOpen = useRef(false);

	useEffect(() => {
		const desktop = window.matchMedia("(min-width: 64.001rem)");
		const update = (matches: boolean) => {
			if (!disclosureRef.current) return;
			if (matches) {
				mobileOpen.current = disclosureRef.current.open;
				disclosureRef.current.open = true;
			} else disclosureRef.current.open = mobileOpen.current;
		};
		update(desktop.matches);
		const change = (event: MediaQueryListEvent) => update(event.matches);
		desktop.addEventListener("change", change);
		return () => desktop.removeEventListener("change", change);
	}, []);

	useEffect(() => {
		let active = true;
		loadPagefind()
			.then(async (api) => {
				await api.init();
				await api.filters();
				if (!active) return;
				const initial = parseSearchState(new URLSearchParams(window.location.search));
				startTransition(() => {
					setPagefind(api);
					setQuery(initial.query);
					setFilters(initial.filters);
					setStatus("ready");
				});
			})
			.catch(() => { if (active) setStatus("unavailable"); });
		return () => { active = false; };
	}, []);

	useEffect(() => {
		if (!pagefind) return;
		let active = true;
		const run = async () => {
			if (!hasSearchCriteria(deferredQuery, filters)) {
				startTransition(() => { setResults(null); setStatus("ready"); });
				return;
			}
			setStatus("searching");
			try {
				const response = await pagefind.search(deferredQuery.trim() || null, { filters: toPagefindFilters(filters) });
				const nextResults = await Promise.all(response.results.map((result) => result.data()));
				if (active) startTransition(() => { setResults(nextResults); setStatus("ready"); });
			} catch {
				if (active) setStatus("unavailable");
			}
		};
		void run();
		return () => { active = false; };
	}, [deferredQuery, filters, pagefind]);

	const updateUrl = (nextQuery: string, nextFilters: SearchFilters) => {
		const searchParams = toSearchParams(nextQuery, nextFilters);
		window.history.replaceState(null, "", searchParams.size ? `/blog?${searchParams}` : "/blog");
	};

	const selectFilter = (key: SearchFilterKey, value: string) => {
		const nextFilters = toggleSearchFilter(filters, key, value);
		setFilters(nextFilters);
		setVisibleLimit(POST_BATCH_SIZE);
		updateUrl(query, nextFilters);
	};

	const criteriaActive = hasSearchCriteria(query, filters);
	const interactive = Boolean(pagefind) && status !== "unavailable";
	const resultCount = results?.length ?? posts.length;
	const listedPosts = results ? toPostListPosts(results) : posts;
	const visibleCount = Math.min(visibleLimit, listedPosts.length);
	const hasMorePosts = hydrated && visibleCount < listedPosts.length;
	return (
		<div className="archive-layout mt-12 grid grid-cols-1 gap-12 sm:mt-16 lg:grid-cols-[15rem_minmax(0,1fr)] xl:gap-20">
			<aside aria-label="記事を探す" className="discovery-sidebar self-start lg:sticky lg:top-6">
				<form action="/blog" className="archive-search mb-8 max-w-md lg:max-w-none" onSubmit={(event) => { if (interactive) event.preventDefault(); }} role="search">
					<label className="discovery-heading mb-3 block text-base leading-6 font-semibold" htmlFor="archive-search">記事を検索</label>
					<div className="archive-search__field relative"><SearchIcon /><input className="h-11 w-full rounded-md border border-control-border bg-surface-raised py-2 pr-3 pl-9 text-sm text-site-text placeholder:text-text-muted" id="archive-search" name="q" onChange={(event) => { setQuery(event.target.value); setVisibleLimit(POST_BATCH_SIZE); updateUrl(event.target.value, filters); }} placeholder="キーワードを入力" type="search" value={query} /></div>
				</form>
				<details className="filter-disclosure group" onToggle={(event) => { if (!window.matchMedia("(min-width: 64.001rem)").matches) mobileOpen.current = event.currentTarget.open; }} open ref={disclosureRef}>
					<summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-base font-semibold lg:hidden"><span>記事を絞り込む</span><span aria-hidden="true" className="disclosure-indicator inline-block h-1.5 w-2.5 bg-text-muted [clip-path:polygon(0_0,100%_0,50%_100%)] group-open:rotate-180" /></summary>
					<nav className="filter-panel hidden grid-cols-1 gap-8 pt-6 group-open:grid sm:grid-cols-2 lg:!block lg:pt-0" aria-label="記事の分類">
						<h2 className="filter-panel__heading mb-3 hidden text-base leading-6 font-semibold lg:block">記事を絞り込む</h2>
						<TaxonomyGroup interactive={interactive} label="カテゴリー" values={taxonomy.categories} parameter="category" filters={filters} onSelect={selectFilter} query={query} />
						<TaxonomyGroup interactive={interactive} label="タグ" values={taxonomy.tags} parameter="tag" filters={filters} onSelect={selectFilter} query={query} />
						<TaxonomyGroup interactive={interactive} label="年" values={taxonomy.years} parameter="year" filters={filters} onSelect={selectFilter} query={query} format={(value) => `${value}年`} />
						<TaxonomyGroup interactive={interactive} label="月" values={taxonomy.months} parameter="month" filters={filters} onSelect={selectFilter} query={query} format={formatMonth} />
					</nav>
				</details>
			</aside>

			<section aria-labelledby="post-list-heading">
				<header className="results-heading mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-baseline"><h2 className="text-2xl leading-8 font-semibold tracking-tight" id="post-list-heading">記事一覧</h2><SearchStatus status={status} count={resultCount} criteriaActive={criteriaActive} /></header>
				{results?.length === 0 ? <p className="search-empty text-text-muted">条件に一致する記事はありません。</p> : null}
				{listedPosts.length > 0 ? <PostList posts={listedPosts} visibleCount={visibleCount} /> : null}
				{hasMorePosts ? <div className="load-more-region pt-8 text-center"><p className="mb-3 text-sm text-text-muted" id="visible-count">{listedPosts.length}件中{visibleCount}件を表示</p><button aria-describedby="visible-count" className="load-more min-h-11 cursor-pointer rounded-md border border-control-border bg-surface-raised px-4 py-3 font-medium text-site-text hover:bg-hover-surface motion-safe:transition-colors motion-safe:duration-150" onClick={() => setVisibleLimit((current) => Math.min(current + POST_BATCH_SIZE, listedPosts.length))} type="button">さらに読み込む</button></div> : null}
			</section>
			<noscript><p className="search-note text-text-muted">検索と絞り込みにはJavaScriptが必要です。すべての記事は一覧から読めます。</p></noscript>
		</div>
	);
}

function SearchStatus({ status, count, criteriaActive }: { status: SearchStatus; count: number; criteriaActive: boolean }) {
	const className = "m-0 text-sm text-text-muted";
	if (status === "loading") return <p aria-live="polite" className={className}>検索を準備しています。</p>;
	if (status === "unavailable") return <p aria-live="polite" className={className}>検索を利用できません。すべての記事を表示しています。</p>;
	if (status === "searching") return <p aria-live="polite" className={className}>検索しています。</p>;
	return <p aria-live="polite" className={className}>{criteriaActive ? `${count}件の記事が見つかりました。` : `全${count}件`}</p>;
}

function toPostListPosts(results: readonly PagefindResultData[]): PostListPost[] {
	return results.map((result) => ({
		imageUrl: result.meta.image || undefined,
		metadata: {
			category: result.meta.category ?? "",
			date: result.meta.date ?? "",
			tags: result.meta.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
			title: result.meta.title ?? result.url,
		},
		url: result.meta.url ?? result.url,
	}));
}

function formatMonth(value: string) {
	const [year, month] = value.split("-");
	return `${year}年${Number(month)}月`;
}

function TaxonomyGroup({ filters, format = (value) => value, interactive, label, onSelect, parameter, query, values }: {
	filters: SearchFilters;
	format?: (value: string) => string;
	interactive: boolean;
	label: string;
	onSelect: (key: SearchFilterKey, value: string) => void;
	parameter: SearchFilterKey;
	query: string;
	values: string[];
}) {
	return (
		<section className="filter-group lg:[&+&]:mt-8">
			<h2 className="mb-2.5 text-sm font-medium text-text-muted">{label}</h2>
			<ul className="flex list-none flex-col items-start gap-1 p-0">
				{values.map((value) => {
					const selected = isSearchFilterSelected(filters, parameter, value);
					const nextSearchParams = toSearchParams(query, toggleSearchFilter(filters, parameter, value));
					const href = nextSearchParams.size ? `/blog?${nextSearchParams}` : "/blog";
					return <li key={value}><a aria-current={selected ? "true" : undefined} className="inline-flex min-h-8 items-center rounded-md px-2 py-1 text-sm no-underline hover:bg-hover-surface aria-current:bg-selected-surface aria-current:font-semibold aria-current:text-action motion-safe:transition-colors motion-safe:duration-150" href={href} onClick={(event) => { if (!interactive || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onSelect(parameter, value); }}>{format(value)}</a></li>;
				})}
			</ul>
		</section>
	);
}
