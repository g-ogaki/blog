import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostMarkdown } from "@/components/post-markdown";
import { CommentSection } from "@/components/comment-section";
import { loadPosts, type Post } from "@/lib/content/posts";
import { formatPostDate } from "@/lib/format-date";
import { blogPath, getDictionary, postPath, type Locale } from "@/lib/i18n";

export interface PostPageParams {
	post: string;
	year: string;
}

interface PostPageProps {
	locale: Locale;
	params: Promise<{ year: string; post: string }>;
}

function routablePosts(locale: Locale | "all") {
	return loadPosts({ includeDrafts: process.env.NODE_ENV === "development", locale });
}

function findPost({ year, post }: PostPageParams, locale: Locale, posts = routablePosts(locale)) {
	return posts.find((candidate) => candidate.locale === locale && candidate.year === year && candidate.directoryName === post);
}

function openGraphImage(post: Post) {
	return post.metadata.image ? `/post-assets/${post.slug}/${post.metadata.image}` : "/cat.jpg";
}

function TranslationNotice({ postSlug }: { postSlug: string }) {
	const copy = getDictionary("en").translationNotice;
	return (
		<aside aria-label={copy.label} className="mt-8 rounded-md border border-site-border bg-surface-subtle px-4 py-3 text-sm leading-6 text-text-muted" data-pagefind-ignore="" lang="en">
			<p className="m-0">{copy.beforeLink}<Link className="font-medium" href={postPath("ja", postSlug)}>{copy.link}</Link>{copy.afterLink}</p>
		</aside>
	);
}

export function generatePostStaticParams(locale: Locale) {
	return routablePosts(locale).map((post) => ({ year: post.year, post: post.directoryName }));
}

export async function generatePostMetadata(locale: Locale, params: Promise<PostPageParams>): Promise<Metadata> {
	const allPosts = routablePosts("all");
	const post = findPost(await params, locale, allPosts);
	if (!post) notFound();
	const translations = allPosts.filter((candidate) => candidate.slug === post.slug);
	const languageUrls = Object.fromEntries(translations.map((translation) => [translation.locale, translation.url]));
	const japaneseUrl = languageUrls.ja;
	return {
		title: post.metadata.title,
		description: post.description,
		alternates: {
			canonical: post.url,
			languages: { ...languageUrls, "x-default": japaneseUrl ?? post.url },
		},
		openGraph: {
			type: "article",
			title: post.metadata.title,
			description: post.description,
			url: post.url,
			publishedTime: `${post.metadata.date}T00:00:00+09:00`,
			authors: ["moni"],
			images: [openGraphImage(post)],
			locale: locale === "ja" ? "ja_JP" : "en_US",
			alternateLocale: translations.filter((translation) => translation.locale !== locale).map((translation) => translation.locale === "ja" ? "ja_JP" : "en_US"),
		},
	};
}

export async function LocalizedPostPage({ locale, params }: PostPageProps) {
	const posts = routablePosts("all");
	const post = findPost(await params, locale, posts);
	if (!post) notFound();
	const copy = getDictionary(locale).post;
	const content = await PostMarkdown({ post, posts });
	const imageUrl = post.metadata.image ? `/post-assets/${post.slug}/${post.metadata.image}` : "";
	return (
		<main className="entry-main mx-auto w-full max-w-7xl px-4 pt-6 pb-16 sm:px-6 md:pt-8 md:pb-24" id="main-content">
			<nav className="breadcrumb mb-8 text-sm md:mb-12" aria-label={copy.breadcrumb}><ol className="m-0 flex list-none flex-wrap gap-2 p-0 text-text-subtle"><li><Link className="-m-1 inline-flex rounded-sm p-1 font-normal text-site-text no-underline hover:bg-hover-surface" href={blogPath(locale)}>{copy.blog}</Link></li><li aria-hidden="true">/</li><li><span aria-current="page">{post.metadata.title}</span></li></ol></nav>
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
					<div className="article-meta mt-6 text-sm text-text-muted"><time dateTime={post.metadata.date}>{formatPostDate(post.metadata.date, locale)}</time></div>
					<ul className="tag-list mt-4 flex list-none flex-wrap gap-2 p-0" aria-label={copy.tags}>
						{post.metadata.tags.map((tag) => <li className="rounded-full bg-muted-container px-2.5 py-1 text-xs text-text-muted" data-pagefind-filter="tag" key={tag}>{tag}</li>)}
					</ul>
				</header>
				{locale === "en" ? <TranslationNotice postSlug={post.slug} /> : null}
				{content}
			</article>
			<CommentSection locale={locale} postSlug={post.slug} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
		</main>
	);
}
