import rehypeShiki from "@shikijs/rehype";
import rehypeKatex from "rehype-katex";
import { MarkdownAsync, defaultUrlTransform } from "react-markdown";
import remarkMath from "remark-math";
import {
	extractStandaloneLinkUrls,
	loadCachedLinkPreview,
	type LinkPreview,
	type LinkPreviewLoader,
} from "@/lib/content/link-preview";
import type { Post } from "@/lib/content/posts";

interface PostMarkdownProps {
	loadLinkPreview?: LinkPreviewLoader;
	post: Post;
}

function isAbsoluteOrFragmentUrl(url: string) {
	return url.startsWith("/") || url.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(url);
}

export function resolvePostAssetUrl(url: string, postSlug: string) {
	const resolvedUrl = isAbsoluteOrFragmentUrl(url) ? url : `/post-assets/${postSlug}/${url}`;
	return defaultUrlTransform(resolvedUrl);
}

function LinkCard({ preview }: { preview: LinkPreview }) {
	return (
		<a className="link-card" href={preview.url}>
			<span className="link-card-copy">
				<strong>{preview.title}</strong>
				{preview.description ? <span>{preview.description}</span> : null}
				<small>{preview.provider}</small>
			</span>
			{preview.image ? (
				<span
					aria-hidden="true"
					className="link-card-image"
					style={{ backgroundImage: `url(${JSON.stringify(preview.image)})` }}
				/>
			) : null}
		</a>
	);
}

export async function PostMarkdown({ post, loadLinkPreview = loadCachedLinkPreview }: PostMarkdownProps) {
	const previewEntries = await Promise.all(
		extractStandaloneLinkUrls(post.content).map(async (url) => [url, await loadLinkPreview(url)] as const),
	);
	const previews = new Map(previewEntries);
	const content = await MarkdownAsync({
		children: post.content,
		components: {
			p({ children }) {
				if (typeof children !== "string" || !previews.has(children)) return <p>{children}</p>;
				const preview = previews.get(children);
				return preview ? <LinkCard preview={preview} /> : <p><a href={children}>{children}</a></p>;
			},
		},
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
