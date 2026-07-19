import type { Element, ElementContent, Properties, Root, RootContent } from "hast";
import type { Schema } from "hast-util-sanitize";
import rehypeRaw from "rehype-raw";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const globalProperties = ["ariaDescribedBy", "ariaHidden", "ariaLabel", "ariaLabelledBy", "dir", "lang", "title"] as const;

export const articleHtmlElements = [
	"a", "abbr", "audio", "b", "blockquote", "br", "cite", "code", "dd", "del", "details", "div", "dl", "dt",
	"em", "figcaption", "figure", "h2", "h3", "h4", "h5", "h6", "hr", "i", "iframe", "img", "ins", "kbd",
	"li", "mark", "ol", "p", "pre", "q", "s", "samp", "small", "source", "span", "strong", "sub", "summary",
	"sup", "table", "tbody", "td", "tfoot", "th", "thead", "time", "tr", "track", "u", "ul", "var", "video",
] as const;

type ArticleHtmlElement = (typeof articleHtmlElements)[number];

const propertiesByElement: Record<ArticleHtmlElement, readonly string[]> = {
	a: ["href", "hrefLang"],
	abbr: [],
	audio: ["controls", "loop", "muted", "preload", "src"],
	b: [],
	blockquote: ["cite"],
	br: [],
	cite: [],
	code: ["className"],
	dd: [],
	del: ["cite", "dateTime"],
	details: ["open"],
	div: [],
	dl: [],
	dt: [],
	em: [],
	figcaption: [],
	figure: [],
	h2: [],
	h3: [],
	h4: [],
	h5: [],
	h6: [],
	hr: [],
	i: [],
	iframe: ["allow", "allowFullScreen", "frameBorder", "height", "loading", "referrerPolicy", "sandbox", "src", "title", "width"],
	img: ["alt", "height", "loading", "src", "title", "width"],
	ins: ["cite", "dateTime"],
	kbd: [],
	li: ["value"],
	mark: [],
	ol: ["reversed", "start", "type"],
	p: ["dataInternalLinkCard"],
	pre: [],
	q: ["cite"],
	s: [],
	samp: [],
	small: [],
	source: ["media", "src", "type"],
	span: [],
	strong: [],
	sub: [],
	summary: [],
	sup: [],
	table: [],
	tbody: [],
	td: ["colSpan", "headers", "rowSpan"],
	tfoot: [],
	th: ["abbr", "colSpan", "headers", "rowSpan", "scope"],
	thead: [],
	time: ["dateTime"],
	tr: [],
	track: ["default", "kind", "label", "src", "srcLang"],
	u: [],
	ul: [],
	var: [],
	video: ["controls", "height", "loop", "muted", "playsInline", "poster", "preload", "src", "width"],
};

const allowedElements = new Set<string>(articleHtmlElements);
const unsafeElementsToStrip = ["base", "button", "embed", "form", "input", "link", "meta", "object", "script", "style", "textarea"];
const youtubeHosts = new Set(["youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);

export class ArticleHtmlPolicyError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ArticleHtmlPolicyError";
	}
}

interface ArticleHtmlPolicyOptions {
	onImageSource?: (source: string) => void;
	onLink?: (href: string) => void;
}

function location(node: Element) {
	return node.position?.start.line ? `line ${node.position.start.line}: ` : "";
}

function fail(node: Element, message: string): never {
	throw new ArticleHtmlPolicyError(`${location(node)}${message}`);
}

function textContent(children: readonly ElementContent[]): string {
	return children.map((child) => {
		if (child.type === "text") return child.value;
		if (child.type === "element") return textContent(child.children);
		return "";
	}).join("");
}

function isAllowedCodeClass(value: Properties[string]) {
	if (!Array.isArray(value)) return false;
	return value.every((entry) => typeof entry === "string" && (
		entry === "math-inline" || entry === "math-display" || /^language-[a-z\d][a-z\d+_-]*$/iu.test(entry)
	));
}

function validateProperties(node: Element) {
	const allowed = new Set([...(propertiesByElement[node.tagName as ArticleHtmlElement] ?? []), ...globalProperties]);
	for (const [property, value] of Object.entries(node.properties)) {
		if (!allowed.has(property)) fail(node, `<${node.tagName}> does not allow the "${property}" attribute`);
		if (property === "className" && !isAllowedCodeClass(value)) {
			fail(node, `<${node.tagName}> contains an unsupported class`);
		}
	}
}

function requireHttpsUrl(node: Element, property: "poster" | "src") {
	const value = node.properties[property];
	if (typeof value !== "string") return;
	try {
		const url = new URL(value);
		if (url.protocol !== "https:" || url.username || url.password) throw new Error();
	} catch {
		fail(node, `<${node.tagName}> ${property} must be an absolute HTTPS URL`);
	}
}

function validateSafeUrl(node: Element, property: "cite" | "href" | "src") {
	const value = node.properties[property];
	if (typeof value !== "string" || !value) return;
	if (value.startsWith("/") || value.startsWith("#") || value.startsWith("?")) return;
	if (!/^[a-z][a-z\d+.-]*:/iu.test(value)) return;
	const allowedProtocols = property === "href"
		? new Set(["http:", "https:", "irc:", "ircs:", "mailto:", "xmpp:"])
		: new Set(["http:", "https:"]);
	try {
		if (!allowedProtocols.has(new URL(value).protocol)) throw new Error();
	} catch {
		fail(node, `<${node.tagName}> ${property} uses an unsupported URL`);
	}
}

function normalizeYoutubeIframe(node: Element) {
	const source = node.properties.src;
	const title = node.properties.title;
	if (typeof source !== "string") fail(node, "<iframe> requires a src attribute");
	if (typeof title !== "string" || !title.trim()) fail(node, "<iframe> requires a nonempty title attribute");

	let url: URL;
	try {
		url = new URL(source);
	} catch {
		fail(node, "<iframe> src must be a valid YouTube embed URL");
	}
	if (url.protocol !== "https:" || url.username || url.password || url.port || !youtubeHosts.has(url.hostname.toLowerCase())) {
		fail(node, "<iframe> only supports HTTPS YouTube embeds");
	}
	if (!/^\/embed\/(?:[A-Za-z\d_-]{6,}|videoseries)$/u.test(url.pathname)) {
		fail(node, "<iframe> src must use YouTube's /embed/ URL format");
	}

	url.hostname = "www.youtube-nocookie.com";
	for (const parameter of ["autoplay", "enablejsapi", "origin", "widget_referrer"]) url.searchParams.delete(parameter);
	url.searchParams.set("controls", "1");
	url.searchParams.set("playsinline", "1");
	node.properties = {
		allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share",
		allowFullScreen: true,
		loading: "lazy",
		referrerPolicy: "strict-origin-when-cross-origin",
		sandbox: ["allow-same-origin", "allow-scripts", "allow-presentation"],
		src: url.href,
		title: title.trim(),
	};
}

function validateMedia(node: Element, ancestors: readonly Element[]) {
	if (node.properties.autoPlay !== undefined) fail(node, `<${node.tagName}> does not allow autoplay`);
	if (node.tagName === "source" || node.tagName === "track") {
		const parent = ancestors.at(-1);
		if (!parent || (parent.tagName !== "audio" && parent.tagName !== "video")) {
			fail(node, `<${node.tagName}> must be a direct child of audio or video`);
		}
	}
	if (node.tagName === "audio" || node.tagName === "video" || node.tagName === "source" || node.tagName === "track") {
		requireHttpsUrl(node, "src");
	}
	if ((node.tagName === "source" || node.tagName === "track") && typeof node.properties.src !== "string") {
		fail(node, `<${node.tagName}> requires a src attribute`);
	}
	if (node.tagName === "video") requireHttpsUrl(node, "poster");
	if (node.tagName === "audio" || node.tagName === "video") {
		const hasSource = typeof node.properties.src === "string" || node.children.some((child) => child.type === "element" && child.tagName === "source");
		if (!hasSource) fail(node, `<${node.tagName}> requires src or a source child`);
		node.properties.controls = true;
		node.properties.preload = "metadata";
	}
}

function validateDetails(node: Element, ancestors: readonly Element[]) {
	if (node.tagName === "summary") {
		if (ancestors.at(-1)?.tagName !== "details") fail(node, "<summary> must be a direct child of details");
		if (!textContent(node.children).trim()) fail(node, "<summary> must not be empty");
	}
	if (node.tagName !== "details") return;
	const firstElement = node.children.find((child): child is Element => child.type === "element");
	if (firstElement?.tagName !== "summary") fail(node, "<details> requires summary as its first element");
}

export function applyArticleHtmlPolicy(tree: Root, options: ArticleHtmlPolicyOptions = {}) {
	const walk = (children: readonly RootContent[], ancestors: readonly Element[]) => {
		for (const child of children) {
			if (child.type !== "element") continue;
			if (!allowedElements.has(child.tagName)) fail(child, `<${child.tagName}> is not allowed in article HTML`);
			validateProperties(child);
			validateDetails(child, ancestors);
			if (child.tagName === "iframe") normalizeYoutubeIframe(child);
			validateMedia(child, ancestors);
			if (child.tagName === "a") {
				validateSafeUrl(child, "href");
				if (typeof child.properties.href === "string") options.onLink?.(child.properties.href);
			}
			if (child.tagName === "blockquote" || child.tagName === "del" || child.tagName === "ins" || child.tagName === "q") validateSafeUrl(child, "cite");
			if (child.tagName === "img") {
				validateSafeUrl(child, "src");
				if (typeof child.properties.src === "string") options.onImageSource?.(child.properties.src);
			}
			walk(child.children, [...ancestors, child]);
		}
	};
	walk(tree.children, []);
	return tree;
}

export function rehypeArticleHtmlPolicy(options?: ArticleHtmlPolicyOptions) {
	return (tree: Root) => applyArticleHtmlPolicy(tree, options);
}

export function validateArticleHtml(markdown: string, options?: ArticleHtmlPolicyOptions) {
	const processor = unified()
		.use(remarkParse)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeArticleHtmlPolicy, options);
	const tree = processor.parse(markdown);
	processor.runSync(tree);
}

const schemaAttributes: Schema["attributes"] = Object.fromEntries(
	Object.entries(propertiesByElement).map(([element, properties]) => [element, [...properties]]),
);
schemaAttributes["*"] = [...globalProperties];
schemaAttributes.code = [["className", /^language-[a-z\d][a-z\d+_-]*$/iu, "math-inline", "math-display"]];

export const articleHtmlSanitizeSchema: Schema = {
	allowComments: false,
	allowDoctypes: false,
	ancestors: {
		source: ["audio", "video"],
		summary: ["details"],
		tbody: ["table"],
		td: ["table"],
		tfoot: ["table"],
		th: ["table"],
		thead: ["table"],
		tr: ["table"],
		track: ["audio", "video"],
	},
	attributes: schemaAttributes,
	clobber: [],
	clobberPrefix: "",
	protocols: {
		cite: ["http", "https"],
		href: ["http", "https", "irc", "ircs", "mailto", "xmpp"],
		poster: ["https"],
		src: ["http", "https"],
	},
	required: {},
	strip: unsafeElementsToStrip,
	tagNames: [...articleHtmlElements],
};
