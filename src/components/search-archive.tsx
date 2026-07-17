"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { PostList, type PostListPost } from "@/components/post-list";
import { loadPagefind, type PagefindApi, type PagefindResultData } from "@/lib/pagefind-client";
import type { Taxonomy } from "@/lib/content/taxonomy";
import {
	hasSearchCriteria,
	parseSearchState,
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

function SearchIcon() {
	return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

export function SearchArchive({ posts, taxonomy }: SearchArchiveProps) {
	const [pagefind, setPagefind] = useState<PagefindApi>();
	const [query, setQuery] = useState("");
	const [filters, setFilters] = useState<SearchFilters>({});
	const [results, setResults] = useState<PagefindResultData[] | null>(null);
	const [status, setStatus] = useState<SearchStatus>("loading");
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

	const selectFilter = (key: SearchFilterKey, value?: string) => {
		const nextFilters = { ...filters, [key]: filters[key] === value ? undefined : value };
		setFilters(nextFilters);
		updateUrl(query, nextFilters);
	};

	const clearSearch = () => {
		setQuery("");
		setFilters({});
		updateUrl("", {});
	};

	const criteriaActive = hasSearchCriteria(query, filters);
	const interactive = Boolean(pagefind) && status !== "unavailable";
	const resultCount = results?.length ?? posts.length;
	return (
		<div className="archive-layout">
			<aside aria-label="記事を探す" className="discovery-sidebar">
				<form action="/blog" className="archive-search" onSubmit={(event) => { if (interactive) event.preventDefault(); }} role="search">
					<label className="discovery-heading" htmlFor="archive-search">記事を検索</label>
					<div className="archive-search-field"><SearchIcon /><input id="archive-search" name="q" onChange={(event) => { setQuery(event.target.value); updateUrl(event.target.value, filters); }} placeholder="キーワードを入力" type="search" value={query} /></div>
					{criteriaActive ? <button className="clear-search" onClick={clearSearch} type="button">条件をクリア</button> : null}
				</form>
				<details className="filter-disclosure" onToggle={(event) => { if (!window.matchMedia("(min-width: 64.001rem)").matches) mobileOpen.current = event.currentTarget.open; }} open ref={disclosureRef}>
					<summary><span>記事を絞り込む</span><span aria-hidden="true" className="disclosure-indicator" /></summary>
					<nav className="filter-panel" aria-label="記事の分類">
						<h2 className="filter-panel-heading">記事を絞り込む</h2>
						<TaxonomyGroup interactive={interactive} label="カテゴリー" values={taxonomy.categories} parameter="category" filters={filters} onSelect={selectFilter} showAll />
						<TaxonomyGroup interactive={interactive} label="タグ" values={taxonomy.tags} parameter="tag" filters={filters} onSelect={selectFilter} />
						<TaxonomyGroup interactive={interactive} label="年" values={taxonomy.years} parameter="year" filters={filters} onSelect={selectFilter} format={(value) => `${value}年`} />
						<TaxonomyGroup interactive={interactive} label="月" values={taxonomy.months} parameter="month" filters={filters} onSelect={selectFilter} format={formatMonth} />
					</nav>
				</details>
			</aside>

			<section aria-labelledby="post-list-heading">
				<header className="results-heading"><h2 id="post-list-heading">記事一覧</h2><SearchStatus status={status} count={resultCount} criteriaActive={criteriaActive} /></header>
				{results?.length === 0 ? <p className="search-empty">条件に一致する記事はありません。</p> : null}
				{results && results.length > 0 ? <SearchResultList results={results} /> : null}
				{results === null ? <PostList posts={posts} /> : null}
			</section>
			<noscript><p className="search-note">検索と絞り込みにはJavaScriptが必要です。すべての記事は一覧から読めます。</p></noscript>
		</div>
	);
}

function SearchStatus({ status, count, criteriaActive }: { status: SearchStatus; count: number; criteriaActive: boolean }) {
	if (status === "loading") return <p aria-live="polite">検索を準備しています。</p>;
	if (status === "unavailable") return <p aria-live="polite">検索を利用できません。すべての記事を表示しています。</p>;
	if (status === "searching") return <p aria-live="polite">検索しています。</p>;
	return <p aria-live="polite">{criteriaActive ? `${count}件の記事が見つかりました。` : `全${count}件の記事`}</p>;
}

function SearchResultList({ results }: { results: PagefindResultData[] }) {
	return <PostList posts={results.map((result) => ({
		imageUrl: result.meta.image || undefined,
		metadata: {
			category: result.meta.category ?? "",
			date: result.meta.date ?? "",
			summary: result.meta.summary ?? result.plain_excerpt,
			tags: result.meta.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
			title: result.meta.title ?? result.url,
		},
		url: result.meta.url ?? result.url,
	}))} />;
}

function formatMonth(value: string) {
	const [year, month] = value.split("-");
	return `${year}年${Number(month)}月`;
}

function TaxonomyGroup({ filters, format = (value) => value, interactive, label, onSelect, parameter, showAll = false, values }: {
	filters: SearchFilters;
	format?: (value: string) => string;
	interactive: boolean;
	label: string;
	onSelect: (key: SearchFilterKey, value?: string) => void;
	parameter: SearchFilterKey;
	showAll?: boolean;
	values: string[];
}) {
	return (
		<section className="filter-group">
			<h2>{label}</h2>
			<ul>
				{showAll ? <li><Link aria-current={!filters[parameter] ? "true" : undefined} href="/blog" onClick={(event) => { if (!interactive) return; event.preventDefault(); onSelect(parameter); }}>すべて</Link></li> : null}
				{values.map((value) => <li key={value}><a aria-current={filters[parameter] === value ? "true" : undefined} href={`/blog?${parameter}=${encodeURIComponent(value)}`} onClick={(event) => { if (!interactive || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onSelect(parameter, value); }}>{format(value)}</a></li>)}
			</ul>
		</section>
	);
}
