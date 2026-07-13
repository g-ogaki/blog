"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { PostList, type PostListPost } from "@/components/post-list";
import { loadPagefind, type PagefindApi, type PagefindResultData } from "@/lib/pagefind-client";
import type { Taxonomy } from "@/lib/content/taxonomy";
import { formatPostDate } from "@/lib/format-date";
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

export function SearchArchive({ posts, taxonomy }: SearchArchiveProps) {
	const [pagefind, setPagefind] = useState<PagefindApi>();
	const [query, setQuery] = useState("");
	const [filters, setFilters] = useState<SearchFilters>({});
	const [results, setResults] = useState<PagefindResultData[] | null>(null);
	const [status, setStatus] = useState<SearchStatus>("loading");
	const deferredQuery = useDeferredValue(query);

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
			.catch(() => {
				if (active) setStatus("unavailable");
			});
		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!pagefind) return;
		let active = true;
		const run = async () => {
			if (!hasSearchCriteria(deferredQuery, filters)) {
				startTransition(() => {
					setResults(null);
					setStatus("ready");
				});
				return;
			}
			setStatus("searching");
			try {
				const response = await pagefind.search(deferredQuery.trim() || null, {
					filters: toPagefindFilters(filters),
				});
				const nextResults = await Promise.all(response.results.map((result) => result.data()));
				if (active) startTransition(() => {
					setResults(nextResults);
					setStatus("ready");
				});
			} catch {
				if (active) setStatus("unavailable");
			}
		};
		void run();
		return () => {
			active = false;
		};
	}, [deferredQuery, filters, pagefind]);

	const updateUrl = (nextQuery: string, nextFilters: SearchFilters) => {
		const searchParams = toSearchParams(nextQuery, nextFilters);
		window.history.replaceState(null, "", searchParams.size ? `/blog?${searchParams}` : "/blog");
	};

	const selectFilter = (key: SearchFilterKey, value: string) => {
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
	return (
		<>
			<div className="search-panel">
				<label htmlFor="archive-search">記事を検索</label>
				<div className="search-input-row">
					<input
						disabled={status === "loading" || status === "unavailable"}
						id="archive-search"
						onChange={(event) => {
							setQuery(event.target.value);
							updateUrl(event.target.value, filters);
						}}
						placeholder="キーワードを入力"
						type="search"
						value={query}
					/>
					{criteriaActive ? <button onClick={clearSearch} type="button">条件をクリア</button> : null}
				</div>
				<SearchStatus status={status} count={results?.length ?? posts.length} criteriaActive={criteriaActive} />
			</div>
			<div className="archive-layout">
				<nav className="taxonomy-nav" aria-label="記事の分類">
					<TaxonomyGroup interactive={interactive} label="カテゴリー" values={taxonomy.categories} parameter="category" filters={filters} onSelect={selectFilter} />
					<TaxonomyGroup interactive={interactive} label="タグ" values={taxonomy.tags} parameter="tag" filters={filters} onSelect={selectFilter} />
					<TaxonomyGroup interactive={interactive} label="年" values={taxonomy.years} parameter="year" filters={filters} onSelect={selectFilter} format={(value) => `${value}年`} />
					<TaxonomyGroup interactive={interactive} label="月" values={taxonomy.months} parameter="month" filters={filters} onSelect={selectFilter} format={formatMonth} />
				</nav>
				<section aria-label="記事一覧" aria-live="polite">
					{results?.length === 0 ? <p className="search-empty">条件に一致する記事はありません。</p> : null}
					{results && results.length > 0 ? <SearchResultList results={results} /> : null}
					{results === null ? <PostList posts={posts} /> : null}
				</section>
			</div>
			<noscript><p className="search-note">検索と絞り込みにはJavaScriptが必要です。すべての記事は下の一覧から読めます。</p></noscript>
		</>
	);
}

function SearchStatus({ status, count, criteriaActive }: { status: SearchStatus; count: number; criteriaActive: boolean }) {
	if (status === "loading") return <p className="search-status">検索を準備しています。</p>;
	if (status === "unavailable") return <p className="search-status">検索を利用できません。すべての記事を表示しています。</p>;
	if (status === "searching") return <p className="search-status">検索しています。</p>;
	return <p className="search-status">{criteriaActive ? `${count}件の記事が見つかりました。` : `全${count}件の記事`}</p>;
}

function SearchResultList({ results }: { results: PagefindResultData[] }) {
	return (
		<div className="post-list">
			{results.map((result, index) => {
				const tags = result.meta.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [];
				return (
					<article className="post-list-item" key={result.meta.url ?? result.url}>
						<span className="post-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
						<div className="post-list-copy">
							<p className="post-meta">
								{result.meta.date ? <time dateTime={result.meta.date}>{formatPostDate(result.meta.date)}</time> : null}
								{result.meta.category ? <><span aria-hidden="true">/</span><span>{result.meta.category}</span></> : null}
							</p>
							<h2><Link href={result.meta.url ?? result.url}>{result.meta.title ?? result.url}</Link></h2>
							<p className="post-list-summary">{result.meta.summary ?? result.plain_excerpt}</p>
							{tags.length ? <ul className="tag-list" aria-label="タグ">{tags.map((tag) => <li key={tag}>#{tag}</li>)}</ul> : null}
						</div>
						<Link className="post-list-arrow" href={result.meta.url ?? result.url} aria-label={`${result.meta.title ?? "記事"}を読む`}>↗</Link>
					</article>
				);
			})}
		</div>
	);
}

function formatMonth(value: string) {
	const [year, month] = value.split("-");
	return `${year}年${Number(month)}月`;
}

function TaxonomyGroup({
	filters,
	format = (value) => value,
	interactive,
	label,
	onSelect,
	parameter,
	values,
}: {
	filters: SearchFilters;
	format?: (value: string) => string;
	interactive: boolean;
	label: string;
	onSelect: (key: SearchFilterKey, value: string) => void;
	parameter: SearchFilterKey;
	values: string[];
}) {
	return (
		<section className="taxonomy-group">
			<h2>{label}</h2>
			<ul>{values.map((value) => (
				<li key={value}>
					<a
						aria-current={filters[parameter] === value ? "true" : undefined}
						href={`/blog?${parameter}=${encodeURIComponent(value)}`}
						onClick={(event) => {
							if (!interactive || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
							event.preventDefault();
							onSelect(parameter, value);
						}}
					>
						{format(value)}
					</a>
				</li>
			))}</ul>
		</section>
	);
}
