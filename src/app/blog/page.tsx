import { SearchArchive } from "@/components/search-archive";
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
	const archivePosts = posts.map((post) => ({
		url: post.url,
		metadata: {
			category: post.metadata.category,
			date: post.metadata.date,
			summary: post.metadata.summary,
			tags: post.metadata.tags,
			title: post.metadata.title,
		},
	}));
	return (
		<main className="site-shell" id="main-content">
			<header className="page-header">
				<p className="eyebrow">All notes / {String(posts.length).padStart(2, "0")}</p>
				<h1>ブログ</h1>
				<p className="page-description">技術、数学、日々の学びを静かに積み重ねています。分類から関心のある記録をたどれます。</p>
			</header>
			<SearchArchive posts={archivePosts} taxonomy={taxonomy} />
		</main>
	);
}
