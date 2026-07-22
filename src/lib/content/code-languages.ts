import type { Code, InlineCode, Root } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

const inlineLanguagePattern = /(.+)\{:([\w-]+)\}$/;
const plainTextLanguages = new Set(["plain", "plaintext", "text", "txt"]);

export interface CodeLanguageUsage {
	filename?: string;
	filenameError?: boolean;
	language: string;
	line?: number;
}

export interface ShikiLanguageInfo {
	aliases?: readonly string[];
	id: string;
}

export interface ResolvedCodeLanguages {
	aliases: Readonly<Record<string, string>>;
	languages: readonly string[];
}

export function parseFencedCodeInfo(info: string) {
	const separator = info.indexOf(":");
	if (separator < 0) return { language: info };
	const language = info.slice(0, separator);
	const filename = info.slice(separator + 1);
	return {
		filename,
		filenameError: !language || !filename || /\s/u.test(filename),
		language,
	};
}

export function remarkCodeFilenames() {
	return (tree: Root) => {
		visit(tree, "code", (node: Code) => {
			if (!node.lang) return;
			const parsed = parseFencedCodeInfo(node.lang);
			if (parsed.filenameError) {
				const location = node.position?.start.line ? ` at line ${node.position.start.line}` : "";
				throw new Error(`invalid fenced code filename${location}`);
			}
			node.lang = parsed.language;
			if (!parsed.filename) return;
			node.data = {
				...node.data,
				hProperties: {
					...node.data?.hProperties,
					"data-code-filename": parsed.filename,
				},
			};
		});
	};
}

export function extractCodeLanguageUsages(content: string): CodeLanguageUsage[] {
	const tree = unified().use(remarkParse).parse(content) as Root;
	const usages: CodeLanguageUsage[] = [];

	visit(tree, "code", (node: Code) => {
		if (!node.lang) return;
		usages.push({ ...parseFencedCodeInfo(node.lang), line: node.position?.start.line });
	});
	visit(tree, "inlineCode", (node: InlineCode) => {
		const match = node.value.match(inlineLanguagePattern);
		if (!match?.[2]) return;
		usages.push({ language: match[2], line: node.position?.start.line });
	});

	return usages;
}

export function resolveCodeLanguages(
	usages: readonly CodeLanguageUsage[],
	availableLanguages: readonly ShikiLanguageInfo[],
	sourcePath: string,
): ResolvedCodeLanguages {
	const canonicalByName = new Map<string, string>();
	for (const language of availableLanguages) {
		canonicalByName.set(language.id, language.id);
		for (const alias of language.aliases ?? []) canonicalByName.set(alias, language.id);
	}

	const languages = new Set<string>();
	const aliases = new Map<string, string>();
	for (const usage of usages) {
		if (usage.filenameError) {
			const location = usage.line ? `:${usage.line}` : "";
			throw new Error(`${sourcePath}${location}: invalid fenced code filename; use language:filename without whitespace`);
		}
		if (plainTextLanguages.has(usage.language)) continue;
		const canonical = canonicalByName.get(usage.language);
		if (!canonical) {
			const location = usage.line ? `:${usage.line}` : "";
			throw new Error(`${sourcePath}${location}: unknown Shiki language \"${usage.language}\"`);
		}
		languages.add(canonical);
		if (usage.language !== canonical) aliases.set(usage.language, canonical);
	}

	return {
		aliases: Object.fromEntries([...aliases].sort(([left], [right]) => left.localeCompare(right))),
		languages: [...languages].sort(),
	};
}
