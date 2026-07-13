import rehypeShiki from "@shikijs/rehype";
import rehypeKatex from "rehype-katex";
import { MarkdownAsync, defaultUrlTransform } from "react-markdown";
import remarkMath from "remark-math";
import {
	extractStandaloneLinkUrls,
	extractStandaloneInternalLinkUrls,
	loadCachedLinkPreview,
	remarkMarkInternalLinkCards,
	type LinkPreview,
	type LinkPreviewLoader,
} from "@/lib/content/link-preview";
import type { Post } from "@/lib/content/posts";

interface PostMarkdownProps {
	loadLinkPreview?: LinkPreviewLoader;
	post: Post;
	posts?: readonly Post[];
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

export async function PostMarkdown({ post, posts = [], loadLinkPreview = loadCachedLinkPreview }: PostMarkdownProps) {
	const previewEntries = await Promise.all(
		extractStandaloneLinkUrls(post.content).map(async (url) => [url, await loadLinkPreview(url)] as const),
	);
	const previews = new Map(previewEntries);
	const internalPreviews = new Map(
		extractStandaloneInternalLinkUrls(post.content).map((url) => {
			const target = posts.find((candidate) => candidate.url === url);
			return [url, target ? {
				url,
				title: target.metadata.title,
				description: target.metadata.summary,
				image: target.metadata.image ? `/post-assets/${target.slug}/${target.metadata.image}` : "/cat.jpg",
				provider: "moni's page",
			} : null] as const;
		}),
	);
	const content = await MarkdownAsync({
		children: post.content,
		components: {
			p({ children, node }) {
				const internalUrl = node?.properties?.["data-internal-link-card"] ?? node?.properties?.dataInternalLinkCard;
				if (typeof internalUrl === "string") {
					const preview = internalPreviews.get(internalUrl);
					return preview ? <LinkCard preview={preview} /> : <p>{children}</p>;
				}
				if (typeof children !== "string" || !previews.has(children)) return <p>{children}</p>;
				const preview = previews.get(children);
				return preview ? <LinkCard preview={preview} /> : <p><a href={children}>{children}</a></p>;
			},
		},
		remarkPlugins: [remarkMath, remarkMarkInternalLinkCards],
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
