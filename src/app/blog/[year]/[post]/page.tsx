import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostMarkdown } from "@/components/post-markdown";
import { loadPosts, type Post } from "@/lib/content/posts";

interface PostPageProps {
	params: Promise<{ year: string; post: string }>;
}

function publishedPosts() {
	return loadPosts({ includeDrafts: false });
}

function findPost({ year, post }: Awaited<PostPageProps["params"]>, posts = publishedPosts()) {
	return posts.find((candidate) => candidate.year === year && candidate.directoryName === post);
}

function openGraphImage(post: Post) {
	return post.metadata.image ? `/post-assets/${post.slug}/${post.metadata.image}` : "/cat.jpg";
}

export const dynamicParams = false;

export function generateStaticParams() {
	return publishedPosts().map((post) => ({ year: post.year, post: post.directoryName }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
	const post = findPost(await params);
	if (!post) notFound();
	return {
		title: post.metadata.title,
		description: post.metadata.summary,
		alternates: { canonical: post.url },
		openGraph: {
			type: "article",
			title: post.metadata.title,
			description: post.metadata.summary,
			url: post.url,
			publishedTime: `${post.metadata.date}T00:00:00+09:00`,
			authors: ["moni"],
			images: [openGraphImage(post)],
		},
	};
}

export default async function PostPage({ params }: PostPageProps) {
	const posts = publishedPosts();
	const post = findPost(await params, posts);
	if (!post) notFound();
	const content = await PostMarkdown({ post, posts });
	return (
		<main className="site-shell">
			<nav className="post-nav" aria-label="パンくず"><Link href="/blog">ブログ</Link><span>/</span><span>{post.year}</span></nav>
			<article className="post-article">
				<header className="post-header">
					<p className="eyebrow">{post.metadata.category}</p>
					<h1>{post.metadata.title}</h1>
					<p className="post-summary">{post.metadata.summary}</p>
					<div className="post-byline"><time dateTime={post.metadata.date}>{post.metadata.date}</time><span>moni</span></div>
				</header>
				{content}
			</article>
		</main>
	);
}
