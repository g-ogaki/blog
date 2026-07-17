import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostMarkdown } from "@/components/post-markdown";
import { CommentSection } from "@/components/comment-section";
import { loadPosts, type Post } from "@/lib/content/posts";
import { formatPostDate } from "@/lib/format-date";

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
	const imageUrl = post.metadata.image ? `/post-assets/${post.slug}/${post.metadata.image}` : "";
	return (
		<main className="shell entry-main" id="main-content">
			<nav className="breadcrumb" aria-label="パンくず"><ol><li><Link href="/blog">ブログ</Link></li><li aria-hidden="true">/</li><li><span aria-current="page">{post.metadata.title}</span></li></ol></nav>
			<article
				className="article"
				data-category={post.metadata.category}
				data-date={post.metadata.date}
				data-image={imageUrl}
				data-month={post.metadata.date.slice(0, 7)}
				data-pagefind-body=""
				data-pagefind-filter="category[data-category], year[data-year], month[data-month]"
				data-pagefind-meta="category[data-category], tags[data-tags], date[data-date], url[data-url], summary[data-summary], image[data-image]"
				data-summary={post.metadata.summary}
				data-tags={post.metadata.tags.join(",")}
				data-url={post.url}
				data-year={post.year}
			>
				<header className="article-header">
					<p className="category-label">{post.metadata.category}</p>
					<h1 data-pagefind-meta="title">{post.metadata.title}</h1>
					<div className="article-meta"><time dateTime={post.metadata.date}>{formatPostDate(post.metadata.date)}</time></div>
					<ul className="tag-list" aria-label="タグ">
						{post.metadata.tags.map((tag) => <li data-pagefind-filter="tag" key={tag}>{tag}</li>)}
					</ul>
				</header>
				{content}
			</article>
			<CommentSection postSlug={post.slug} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
		</main>
	);
}
