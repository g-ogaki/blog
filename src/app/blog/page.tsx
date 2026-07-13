import Link from "next/link";
import { PostList } from "@/components/post-list";
import { loadPosts } from "@/lib/content/posts";
import { buildTaxonomy } from "@/lib/content/taxonomy";

export const metadata = {
	title: "ブログ",
	description: "技術、数学、日々の学びを記録するブログです。",
	alternates: { canonical: "/blog" },
};

export default function BlogPage() {
	const posts = loadPosts({ includeDrafts: false });
	const taxonomy = buildTaxonomy(posts);
	return (
		<main className="site-shell" id="main-content">
			<header className="page-header">
				<p className="eyebrow">All notes / {String(posts.length).padStart(2, "0")}</p>
				<h1>ブログ</h1>
				<p className="page-description">技術、数学、日々の学びを静かに積み重ねています。分類から関心のある記録をたどれます。</p>
			</header>
			<div className="archive-layout">
				<nav className="taxonomy-nav" aria-label="記事の分類">
					<TaxonomyGroup label="カテゴリー" values={taxonomy.categories} parameter="category" />
					<TaxonomyGroup label="タグ" values={taxonomy.tags} parameter="tag" />
					<TaxonomyGroup label="年" values={taxonomy.years} parameter="year" format={(value) => `${value}年`} />
					<TaxonomyGroup label="月" values={taxonomy.months} parameter="month" format={formatMonth} />
				</nav>
				<section aria-label="記事一覧"><PostList posts={posts} /></section>
			</div>
		</main>
	);
}

function formatMonth(value: string) {
	const [year, month] = value.split("-");
	return `${year}年${Number(month)}月`;
}

function TaxonomyGroup({
	format = (value) => value,
	label,
	parameter,
	values,
}: {
	format?: (value: string) => string;
	label: string;
	parameter: "category" | "tag" | "year" | "month";
	values: string[];
}) {
	return (
		<section className="taxonomy-group">
			<h2>{label}</h2>
			<ul>{values.map((value) => <li key={value}><Link href={`/blog?${parameter}=${encodeURIComponent(value)}`}>{format(value)}</Link></li>)}</ul>
		</section>
	);
}
