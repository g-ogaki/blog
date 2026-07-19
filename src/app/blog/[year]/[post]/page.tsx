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
		description: post.description,
		alternates: { canonical: post.url },
		openGraph: {
			type: "article",
			title: post.metadata.title,
			description: post.description,
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
		<main className="entry-main mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 md:pt-8 md:pb-24" id="main-content">
			<nav className="breadcrumb mb-8 text-sm md:mb-12" aria-label="パンくず"><ol className="m-0 flex list-none flex-wrap gap-2 p-0 text-text-subtle"><li><Link className="-m-1 inline-flex rounded-sm p-1 font-normal text-site-text no-underline hover:bg-hover-surface" href="/blog">ブログ</Link></li><li aria-hidden="true">/</li><li><span aria-current="page">{post.metadata.title}</span></li></ol></nav>
			<article
				className="article mx-auto w-full max-w-3xl"
				data-category={post.metadata.category}
				data-date={post.metadata.date}
				data-image={imageUrl}
				data-month={post.metadata.date.slice(0, 7)}
				data-pagefind-body=""
				data-pagefind-filter="category[data-category], year[data-year], month[data-month]"
				data-description={post.description}
				data-pagefind-meta="category[data-category], tags[data-tags], date[data-date], url[data-url], description[data-description], image[data-image]"
				data-tags={post.metadata.tags.join(",")}
				data-url={post.url}
				data-year={post.year}
			>
				<header className="article-header">
					<p className="category-label mb-4 text-sm font-medium text-text-muted">{post.metadata.category}</p>
					<h1 className="text-3xl leading-9 font-semibold tracking-tight sm:text-4xl sm:leading-10" data-pagefind-meta="title">{post.metadata.title}</h1>
					<div className="article-meta mt-6 text-sm text-text-muted"><time dateTime={post.metadata.date}>{formatPostDate(post.metadata.date)}</time></div>
					<ul className="tag-list mt-4 flex list-none flex-wrap gap-2 p-0" aria-label="タグ">
						{post.metadata.tags.map((tag) => <li className="rounded-full bg-muted-container px-2.5 py-1 text-xs text-text-muted" data-pagefind-filter="tag" key={tag}>{tag}</li>)}
					</ul>
				</header>
				{content}
			</article>
			<CommentSection postSlug={post.slug} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
		</main>
	);
}
