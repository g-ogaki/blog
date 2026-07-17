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
		imageUrl: post.metadata.image ? `/post-assets/${post.slug}/${post.metadata.image}` : undefined,
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
		<main className="shell archive-main" id="main-content">
			<header className="page-header">
				<h1>ブログ</h1>
				<p className="page-description">勉強したことの備忘録や日常の出来事</p>
			</header>
			<SearchArchive posts={archivePosts} taxonomy={taxonomy} />
		</main>
	);
}
