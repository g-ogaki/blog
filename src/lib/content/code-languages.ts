import type { Code, InlineCode, Root } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

const inlineLanguagePattern = /(.+)\{:([\w-]+)\}$/;
const plainTextLanguages = new Set(["plain", "plaintext", "text", "txt"]);

export interface CodeLanguageUsage {
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

export function extractCodeLanguageUsages(content: string): CodeLanguageUsage[] {
	const tree = unified().use(remarkParse).parse(content) as Root;
	const usages: CodeLanguageUsage[] = [];

	visit(tree, "code", (node: Code) => {
		if (!node.lang) return;
		usages.push({ language: node.lang, line: node.position?.start.line });
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
