import type { Root } from "mdast";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import { unified } from "unified";

const DESCRIPTION_LIMIT = 120;
const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

interface DescriptionNode {
	children?: readonly DescriptionNode[];
	type: string;
	value?: unknown;
}

interface ExtractedText {
	hasProseText: boolean;
	text: string;
}

function normalizeWhitespace(value: string) {
	return value
		.replace(/\s+/gu, " ")
		.replace(/\s+([、。，．.!！？?;:,])/gu, "$1")
		.replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]) (?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, "$1")
		.trim();
}

function visibleInlineCode(value: string) {
	return value.replace(/\{:[a-z][a-z\d_-]*\}$/iu, "");
}

function extractInlineText(node: DescriptionNode): ExtractedText {
	if (node.type === "text") {
		const text = typeof node.value === "string" ? node.value : "";
		return { hasProseText: Boolean(normalizeWhitespace(text)), text };
	}
	if (node.type === "inlineCode") {
		return { hasProseText: false, text: typeof node.value === "string" ? visibleInlineCode(node.value) : "" };
	}
	if (node.type === "break") return { hasProseText: false, text: " " };
	if (["html", "image", "imageReference", "inlineMath"].includes(node.type)) {
		return { hasProseText: false, text: "" };
	}

	return (node.children ?? []).reduce<ExtractedText>(
		(result, child) => {
			const extracted = extractInlineText(child);
			return {
				hasProseText: result.hasProseText || extracted.hasProseText,
				text: result.text + extracted.text,
			};
		},
		{ hasProseText: false, text: "" },
	);
}

function isStandaloneLink(node: DescriptionNode) {
	const meaningfulChildren = (node.children ?? []).filter((child) => (
		child.type !== "text" || (typeof child.value === "string" && child.value.trim().length > 0)
	));
	return meaningfulChildren.length === 1 && ["link", "linkReference"].includes(meaningfulChildren[0].type);
}

function containsNodeType(node: DescriptionNode, type: string): boolean {
	return node.type === type || (node.children ?? []).some((child) => containsNodeType(child, type));
}

function isStandaloneUrl(value: string) {
	return /^(?:https?:\/\/|mailto:)\S+$/iu.test(value);
}

function truncateDescription(value: string) {
	const graphemes = Array.from(segmenter.segment(value), ({ segment }) => segment);
	if (graphemes.length <= DESCRIPTION_LIMIT) return value;
	return `${graphemes.slice(0, DESCRIPTION_LIMIT - 1).join("")}…`;
}

export function derivePostDescription(markdown: string, title: string) {
	const tree = unified().use(remarkParse).use(remarkMath).parse(markdown) as Root;
	const paragraphs = tree.children.flatMap((node) => {
		if (node.type !== "paragraph" || isStandaloneLink(node) || containsNodeType(node, "html")) return [];
		const extracted = extractInlineText(node);
		const text = normalizeWhitespace(extracted.text);
		if (!extracted.hasProseText || !text || isStandaloneUrl(text)) return [];
		return [text];
	});
	const prose = normalizeWhitespace(paragraphs.join(" "));
	return truncateDescription(prose || `「${title}」についての記事です。`);
}
