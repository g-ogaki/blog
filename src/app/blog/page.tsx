import Link from "next/link";
import { loadPosts } from "@/lib/content/posts";

export const metadata = {
	title: "ブログ",
	description: "技術、数学、日々の学びを記録するブログです。",
	alternates: { canonical: "/blog" },
};

export default function BlogPage() {
	const posts = loadPosts({ includeDrafts: false });
	return (
		<main className="site-shell">
			<header className="page-header">
				<Link className="site-mark" href="/">moni&apos;s page</Link>
				<p className="eyebrow">Journal</p>
				<h1>ブログ</h1>
				<p>技術、数学、日々の学びを静かに積み重ねています。</p>
			</header>
			<section aria-label="記事一覧" className="post-list">
				{posts.map((post, index) => (
					<article className="post-list-item" key={post.url}>
						<span className="post-index">{String(index + 1).padStart(2, "0")}</span>
						<div>
							<p className="post-meta"><time dateTime={post.metadata.date}>{post.metadata.date}</time> · {post.metadata.category}</p>
							<h2><Link href={post.url}>{post.metadata.title}</Link></h2>
							<p>{post.metadata.summary}</p>
							<ul className="tag-list" aria-label="タグ">{post.metadata.tags.map((tag) => <li key={tag}>#{tag}</li>)}</ul>
						</div>
					</article>
				))}
			</section>
		</main>
	);
}
