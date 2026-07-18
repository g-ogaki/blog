import typescript from "@shikijs/langs/typescript";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import githubDark from "@shikijs/themes/github-dark";
import githubLight from "@shikijs/themes/github-light";
import type { Element, Root } from "hast";
import rehypeKatex from "rehype-katex";
import { cloneElement, isValidElement, type ReactElement } from "react";
import { MarkdownAsync, defaultUrlTransform } from "react-markdown";
import remarkMath from "remark-math";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
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

const highlighterPromise = createHighlighterCore({
	engine: createJavaScriptRegexEngine(),
	langs: [typescript],
	themes: [githubLight, githubDark],
});

function isAbsoluteOrFragmentUrl(url: string) {
	return url.startsWith("/") || url.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(url);
}

export function resolvePostAssetUrl(url: string, postSlug: string) {
	const resolvedUrl = isAbsoluteOrFragmentUrl(url) ? url : `/post-assets/${postSlug}/${url}`;
	return defaultUrlTransform(resolvedUrl);
}

function LinkCard({ preview }: { preview: LinkPreview }) {
	return (
		<a className="link-card grid h-auto min-h-0 grid-cols-1 overflow-hidden rounded-md border border-site-border bg-surface-raised no-underline hover:border-action sm:h-48 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,30%)]" href={preview.url}>
			<span className="link-card__copy flex min-w-0 flex-col justify-center gap-2 p-4">
				<strong className="line-clamp-2 text-base text-action">{preview.title}</strong>
				{preview.description ? <span className="line-clamp-3 text-sm text-text-muted">{preview.description}</span> : null}
				<small className="text-xs text-text-muted">{preview.provider}</small>
			</span>
			{preview.image ? (
				// The wireframe uses a decorative image with intrinsic card sizing.
				// eslint-disable-next-line @next/next/no-img-element
				<img alt="" className="order-first h-40 min-h-0 w-full border-b border-site-border bg-surface-subtle object-cover sm:order-none sm:h-full sm:border-b-0 sm:border-l" src={preview.image} />
			) : null}
		</a>
	);
}

function codeLanguageLabel(language: string) {
	return language === "ts" || language === "typescript" ? "typescript" : language;
}

function rehypeNormalizeArticleBlocks() {
	return (tree: Root) => {
		const wrapChildren = (parent: Root | Element) => {
			for (let index = 0; index < parent.children.length; index += 1) {
				const node = parent.children[index];
				if (node.type !== "element") continue;
				const classNames = Array.isArray(node.properties.className) ? node.properties.className : [];
				if (classNames.includes("katex-display") && !classNames.includes("math-block")) {
					node.properties.className = [...classNames, "math-block"];
				}
				if (node.tagName !== "pre") {
					wrapChildren(node);
					continue;
				}
				const code = node.children.find((child): child is Element => child.type === "element" && child.tagName === "code");
				const codeClassNames = code?.properties.className;
				const languageClass = Array.isArray(codeClassNames) ? codeClassNames.find((value) => typeof value === "string" && value.startsWith("language-")) : undefined;
				if (typeof languageClass !== "string") continue;
				parent.children[index] = {
					type: "element",
					tagName: "div",
					properties: { className: ["code-block"], "data-language": codeLanguageLabel(languageClass.slice("language-".length)) },
					children: [node],
				};
			}
		};
		wrapChildren(tree);
	};
}

export async function PostMarkdown({ post, posts = [], loadLinkPreview = loadCachedLinkPreview }: PostMarkdownProps) {
	const highlighter = await highlighterPromise;
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
				const onlyChild = node?.children.length === 1 ? node.children[0] : undefined;
				if (onlyChild?.type === "element" && onlyChild.tagName === "img" && typeof onlyChild.properties.title === "string" && isValidElement(children)) {
					const image = cloneElement(children as ReactElement<{ title?: string }>, { title: undefined });
					return <figure className="article-figure">{image}<figcaption>{onlyChild.properties.title}</figcaption></figure>;
				}
				const internalUrl = node?.properties?.["data-internal-link-card"] ?? node?.properties?.dataInternalLinkCard;
				if (typeof internalUrl === "string") {
					const preview = internalPreviews.get(internalUrl);
					return preview ? <LinkCard preview={preview} /> : <p>{children}</p>;
				}
				if (typeof children !== "string" || !previews.has(children)) return <p>{children}</p>;
				const preview = previews.get(children);
				return preview ? <LinkCard preview={preview} /> : <p><a href={children}>{children}</a></p>;
			},
			div({ children, node, ...properties }) {
				const language = node?.properties?.["data-language"];
				if (typeof language !== "string") return <div {...properties}>{children}</div>;
				return <div {...properties}><div className="code-label">{language}</div>{children}</div>;
			},
		},
		remarkPlugins: [remarkMath, remarkMarkInternalLinkCards],
		rehypePlugins: [
			rehypeKatex,
			rehypeNormalizeArticleBlocks,
			[
				rehypeShikiFromHighlighter,
				highlighter,
				{
					themes: { light: "github-light", dark: "github-dark" },
					defaultColor: false,
					fallbackLanguage: "text",
					inline: "tailing-curly-colon",
				},
			],
		],
		skipHtml: true,
		urlTransform: (url) => resolvePostAssetUrl(url, post.slug),
	});

	return (
		<div className="article-body pt-12 text-base leading-8 md:text-lg md:leading-9">{content}</div>
	);
}
