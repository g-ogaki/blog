import { describe, expect, it } from "vitest";
import type { Post } from "./posts";
import { renderShikiLanguageRegistry } from "../../../scripts/shiki-languages";
import { extractCodeLanguageUsages, resolveCodeLanguages } from "./code-languages";

const languages = [
	{ id: "cpp", aliases: ["c++"] },
	{ id: "javascript", aliases: ["js"] },
	{ id: "python", aliases: ["py"] },
	{ id: "typescript", aliases: ["ts"] },
];

describe("Markdown code languages", () => {
	it("extracts fenced and inline language markers with their source lines", () => {
		const usages = extractCodeLanguageUsages([
			"```py",
			"print('hello')",
			"```",
			"",
			"Use `const value = 1{:ts}` inline.",
			"",
			"```",
			"plain",
			"```",
		].join("\n"));

		expect(usages).toEqual([
			{ language: "py", line: 1 },
			{ language: "ts", line: 5 },
		]);
	});

	it("canonicalizes aliases, deduplicates grammars, and ignores plain-text names", () => {
		const resolved = resolveCodeLanguages([
			{ language: "ts" },
			{ language: "typescript" },
			{ language: "c++" },
			{ language: "text" },
		], languages, "post.md");

		expect(resolved).toEqual({
			aliases: { "c++": "cpp", ts: "typescript" },
			languages: ["cpp", "typescript"],
		});
	});

	it("reports an unknown language with its source location", () => {
		expect(() => resolveCodeLanguages(
			[{ language: "typscript", line: 12 }],
			languages,
			"content/posts/example/index.md",
		)).toThrow('content/posts/example/index.md:12: unknown Shiki language "typscript"');
	});

	it("generates literal lazy imports for each canonical grammar in published content", () => {
		const post = {
			content: [
				"```js\nconst value = 1;\n```",
				"```ts\nconst value: number = 1;\n```",
				"```py\nprint(1)\n```",
				"```cpp\nint main() {}\n```",
				"```json\n{}\n```",
				"```html\n<p>Hello</p>\n```",
				"```css\np { color: blue; }\n```",
			].join("\n\n"),
			sourcePath: "content/posts/example/index.md",
		} as Post;

		const registry = renderShikiLanguageRegistry([post]);
		for (const language of ["javascript", "typescript", "python", "cpp", "json", "html", "css"]) {
			expect(registry).toContain(`import(\"@shikijs/langs/${language}\")`);
		}
		expect(registry).toContain('"js": () => import("@shikijs/langs/javascript")');
		expect(registry).toContain('"ts": () => import("@shikijs/langs/typescript")');
		expect(registry).toContain('"py": () => import("@shikijs/langs/python")');
	});
});
