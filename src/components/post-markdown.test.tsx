import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Post } from "@/lib/content/posts";
import type { LinkPreviewLoader } from "@/lib/content/link-preview";
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

async function renderMarkdown(content: string, loadLinkPreview?: LinkPreviewLoader, posts?: readonly Post[]) {
	const element = await PostMarkdown({ post: createPost(content), loadLinkPreview, posts });
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
		expect(screen.getByText("typescript", { selector: ".code-label" })).toBeInTheDocument();
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
		expect(screen.getByRole("img", { name: "Diagram" })).not.toHaveAttribute("title");
		expect(screen.getByText("Architecture", { selector: "figcaption" })).toBeInTheDocument();
	});

	it("keeps untitled images ordinary and unlabeled code fences unwrapped", async () => {
		const { container } = await renderMarkdown("```\nplain text\n```\n\n![Diagram](images/diagram.png)");

		expect(container.querySelector(".code-label")).not.toBeInTheDocument();
		expect(container.querySelector("figure")).not.toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Diagram" })).toBeInTheDocument();
	});

	it("does not render raw HTML or unsafe URLs", async () => {
		const { container } = await renderMarkdown(
			'<script>alert("xss")</script>\n\n<img src="/unvalidated.png" alt="raw">\n\n[Unsafe](javascript:alert(1))',
		);

		expect(container.querySelector("script")).not.toBeInTheDocument();
		expect(screen.queryByRole("img", { name: "raw" })).not.toBeInTheDocument();
		expect(screen.getByText("Unsafe").closest("a")).toHaveAttribute("href", "");
	});

	it("renders standalone URLs as static cards while inline URLs remain unchanged", async () => {
		const loadLinkPreview = vi.fn(async (url: string) => ({
			url,
			title: "Example preview",
			description: "Fetched during the build.",
			image: "https://example.com/card.png",
			siteName: "Example",
			provider: "Website",
		}));
		await renderMarkdown(
			"https://example.com/post\n\nInline https://example.com/inline remains text.",
			loadLinkPreview,
		);

		expect(screen.getByRole("link", { name: /Example preview/ })).toHaveClass("link-card");
		expect(screen.getByText("Fetched during the build.")).toBeInTheDocument();
		expect(screen.getByText(/Inline https:\/\/example.com\/inline remains text/)).toBeInTheDocument();
		expect(loadLinkPreview).toHaveBeenCalledTimes(1);
	});

	it("falls back to a normal link when preview metadata is unavailable", async () => {
		await renderMarkdown("https://example.com/unavailable", async () => null);

		const link = screen.getByRole("link", { name: "https://example.com/unavailable" });
		expect(link).toHaveAttribute("href", "https://example.com/unavailable");
		expect(link).not.toHaveClass("link-card");
	});

	it("renders a standalone internal Markdown link from post metadata", async () => {
		const target = createPost("Target content");
		target.metadata.title = "Linked post";
		target.metadata.summary = "Local metadata summary.";
		target.url = "/blog/2026/20260503-learning-typescript";
		await renderMarkdown("[Read this](/blog/2026/20260503-learning-typescript)", undefined, [target]);

		const card = screen.getByRole("link", { name: /Linked post/ });
		expect(card).toHaveClass("link-card");
		expect(card).toHaveAttribute("href", target.url);
		expect(screen.getByText("Local metadata summary.")).toBeInTheDocument();
	});

	it("keeps inline internal Markdown links as ordinary links", async () => {
		const target = createPost("Target content");
		await renderMarkdown(
			"Read the [TypeScript article](/blog/2026/20260503-learning-typescript) next.",
			undefined,
			[target],
		);

		const link = screen.getByRole("link", { name: "TypeScript article" });
		expect(link).not.toHaveClass("link-card");
	});
});
