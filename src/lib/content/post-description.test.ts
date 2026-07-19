import { describe, expect, it } from "vitest";
import { derivePostDescription } from "./post-description";

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

describe("derivePostDescription", () => {
	it("combines opening paragraphs as plain visible prose", () => {
		const description = derivePostDescription([
			"## Ignored heading",
			"",
			"Opening **bold** text with a [link label](https://example.com), `inlineCode{:ts}`, and $x^2$.",
			"",
			"Second paragraph.",
		].join("\n"), "Title");

		expect(description).toBe("Opening bold text with a link label, inlineCode, and. Second paragraph.");
	});

	it("skips blocks and paragraphs that are not ordinary prose", () => {
		const description = derivePostDescription([
			"# Heading",
			"",
			"> Quotation",
			"",
			"- List item",
			"",
			"```ts",
			"const answer = 42;",
			"```",
			"",
			"$$x^2$$",
			"",
			"![Image](image.png)",
			"",
			"<strong>Raw HTML</strong>",
			"",
			"https://example.com/card",
			"",
			"[Related post](/blog/2026/related)",
			"",
			"`codeOnly`",
			"",
			"First suitable paragraph.",
		].join("\n"), "Title");

		expect(description).toBe("First suitable paragraph.");
	});

	it("limits descriptions by grapheme without splitting emoji", () => {
		const family = "👨‍👩‍👧‍👦";
		const description = derivePostDescription(`${"猫".repeat(118)}${family}終余`, "Title");

		expect(description).toBe(`${"猫".repeat(118)}${family}…`);
		expect(Array.from(segmenter.segment(description))).toHaveLength(120);
	});

	it("uses a title-based fallback when no suitable prose exists", () => {
		expect(derivePostDescription("## Heading\n\n```ts\nconst value = 1;\n```", "コードだけの記事"))
			.toBe("「コードだけの記事」についての記事です。");

		const boundedFallback = derivePostDescription("![Image](image.png)", "長".repeat(140));
		expect(Array.from(segmenter.segment(boundedFallback))).toHaveLength(120);
		expect(boundedFallback).toMatch(/…$/u);
	});
});
