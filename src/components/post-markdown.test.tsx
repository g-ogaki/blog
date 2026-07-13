import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Post } from "@/lib/content/posts";
import { PostMarkdown } from "./post-markdown";

function createPost(content: string): Post {
	return {
		content,
		directoryName: "20260503-learning-typescript",
		metadata: {
			title: "Synthetic post",
			date: "2026-05-03",
			category: "Programming",
			tags: ["typescript"],
			summary: "Synthetic summary.",
			draft: false,
		},
		slug: "2026/20260503-learning-typescript",
		sourcePath: "/content/posts/2026/20260503-learning-typescript/index.md",
		url: "/blog/2026/20260503-learning-typescript",
		year: "2026",
	};
}

async function renderMarkdown(content: string) {
	const element = await PostMarkdown({ post: createPost(content) });
	return render(element);
}

afterEach(cleanup);

describe("PostMarkdown", () => {
	it("renders semantic Markdown content", async () => {
		await renderMarkdown("## Heading\n\nA **strong** paragraph.\n\n- first\n- second");

		expect(screen.getByRole("heading", { level: 2, name: "Heading" })).toBeInTheDocument();
		expect(screen.getByText("strong").tagName).toBe("STRONG");
		expect(screen.getByRole("list")).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});

	it("renders inline and block mathematics with KaTeX", async () => {
		const { container } = await renderMarkdown("Euler: $e^{i\\pi}+1=0$\n\n$$\n\\int_0^1 x^2 dx\n$$");

		expect(container.querySelectorAll(".katex")).toHaveLength(2);
		expect(container.querySelector(".katex-display")).toBeInTheDocument();
		expect(screen.getAllByText(/e|i|π|1|0/, { selector: ".katex-mathml *" }).length).toBeGreaterThan(0);
	});

	it("highlights fenced and language-marked inline code with Shiki", async () => {
		const { container } = await renderMarkdown(
			"Use `const answer = 42{:ts}`.\n\n```ts\nconst answer: number = 42;\n```",
		);

		const highlightedBlocks = container.querySelectorAll("pre.shiki");
		expect(highlightedBlocks).toHaveLength(1);
		expect(highlightedBlocks[0]).toHaveTextContent("const answer: number = 42;");
		expect(container.querySelector("span.shiki")).toHaveTextContent("const answer = 42");
		expect(container.querySelectorAll(".shiki span[style]").length).toBeGreaterThan(0);
	});

	it("renders links and rewrites post-relative image paths", async () => {
		await renderMarkdown(
			"[Internal](/blog/2026/20260504-next) and [External](https://example.com).\n\n![Diagram](images/diagram.png \"Architecture\")",
		);

		expect(screen.getByRole("link", { name: "Internal" })).toHaveAttribute(
			"href",
			"/blog/2026/20260504-next",
		);
		expect(screen.getByRole("link", { name: "External" })).toHaveAttribute("href", "https://example.com");
		expect(screen.getByRole("img", { name: "Diagram" })).toHaveAttribute(
			"src",
			"/post-assets/2026/20260503-learning-typescript/images/diagram.png",
		);
		expect(screen.getByRole("img", { name: "Diagram" })).toHaveAttribute("title", "Architecture");
	});

	it("does not render raw HTML or unsafe URLs", async () => {
		const { container } = await renderMarkdown(
			'<script>alert("xss")</script>\n\n<img src="/unvalidated.png" alt="raw">\n\n[Unsafe](javascript:alert(1))',
		);

		expect(container.querySelector("script")).not.toBeInTheDocument();
		expect(screen.queryByRole("img", { name: "raw" })).not.toBeInTheDocument();
		expect(screen.getByText("Unsafe").closest("a")).toHaveAttribute("href", "");
	});
});
