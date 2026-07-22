import { describe, expect, it } from "vitest";
import { validateArticleHtml } from "./article-html-policy";

describe("article HTML policy", () => {
	it("accepts semantic article HTML and native disclosure content", () => {
		expect(() => validateArticleHtml([
			"<details open>",
			"<summary><strong>More</strong></summary>",
			"",
			"<mark>Highlighted</mark>",
			"",
			"<table><thead><tr><th scope=\"col\">Name</th></tr></thead><tbody><tr><td>moni</td></tr></tbody></table>",
			"</details>",
	].join("\n"))).not.toThrow();
	});

	it("allows color-only font markup", () => {
		expect(() => validateArticleHtml('<font color="#c00">Red</font> and <font color="blue">blue</font>.')).not.toThrow();
		expect(() => validateArticleHtml('<font face="serif">Text</font>')).toThrow(/does not allow the "face" attribute/);
		expect(() => validateArticleHtml('<font color="rgb(255, 0, 0)">Text</font>')).toThrow(/named or hexadecimal color/);
	});

	it.each([
		["scripts", '<script src="https://example.com/x.js"></script>', /<script> is not allowed/],
		["styles", "<style>body { display: none }</style>", /<style> is not allowed/],
		["event handlers", '<mark onclick="alert(1)">text</mark>', /does not allow the "onClick" attribute/],
		["arbitrary classes", '<div class="overlay">text</div>', /does not allow the "className" attribute/],
		["non-YouTube iframes", '<iframe src="https://example.com/embed/123456" title="Example"></iframe>', /only supports HTTPS YouTube embeds/],
		["iframe without title", '<iframe src="https://www.youtube.com/embed/M7lc1UVf-VE"></iframe>', /requires a nonempty title/],
		["details without summary", "<details>Text</details>", /requires summary as its first element/],
		["orphan summary", "<summary>Text</summary>", /must be a direct child of details/],
		["HTTP media", '<video src="http://example.com/movie.mp4"></video>', /must be an absolute HTTPS URL/],
		["autoplay", '<audio src="https://example.com/audio.mp3" autoplay></audio>', /does not allow the "autoPlay" attribute/],
		["orphan source", '<source src="https://example.com/movie.mp4">', /must be a direct child of audio or video/],
	])("rejects %s", (_label, markdown, message) => {
		expect(() => validateArticleHtml(markdown)).toThrow(message);
	});

	it("does not interpret HTML inside code", () => {
		expect(() => validateArticleHtml([
			"`<script>alert(1)</script>`",
			"",
			"```html",
			'<iframe src="https://example.com"></iframe>',
			"```",
		].join("\n"))).not.toThrow();
	});
});
