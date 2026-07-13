import rehypeShiki from "@shikijs/rehype";
import rehypeKatex from "rehype-katex";
import { MarkdownAsync, defaultUrlTransform } from "react-markdown";
import remarkMath from "remark-math";
import type { Post } from "@/lib/content/posts";

interface PostMarkdownProps {
	post: Post;
}

function isAbsoluteOrFragmentUrl(url: string) {
	return url.startsWith("/") || url.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(url);
}

export function resolvePostAssetUrl(url: string, postSlug: string) {
	const resolvedUrl = isAbsoluteOrFragmentUrl(url) ? url : `/post-assets/${postSlug}/${url}`;
	return defaultUrlTransform(resolvedUrl);
}

export async function PostMarkdown({ post }: PostMarkdownProps) {
	const content = await MarkdownAsync({
		children: post.content,
		remarkPlugins: [remarkMath],
		rehypePlugins: [
			rehypeKatex,
			[
				rehypeShiki,
				{
					themes: { light: "github-light", dark: "github-dark" },
					defaultColor: false,
					fallbackLanguage: "text",
					inline: "tailing-curly-colon",
					langs: ["text"],
					lazy: true,
				},
			],
		],
		skipHtml: true,
		urlTransform: (url) => resolvePostAssetUrl(url, post.slug),
	});

	return (
		<div className="post-markdown">{content}</div>
	);
}
