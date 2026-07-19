import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Post } from "@/lib/content/posts";
import type { LinkPreviewLoader } from "@/lib/content/link-preview";
import { PostMarkdown } from "./post-markdown";

function createPost(content: string): Post {
	return {
		content,
		description: "Synthetic description.",
		directoryName: "20260503-learning-typescript",
		metadata: {
			title: "Synthetic post",
			date: "2026-05-03",
			category: "Programming",
			tags: ["typescript"],
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
		const { container } = await renderMarkdown("## Heading\n\nA **strong** paragraph.\n\n- first\n- second");

		const articleBody = container.querySelector(".article-body");
		expect(articleBody).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "Heading" })).toBeInTheDocument();
		expect(screen.getByText("strong").tagName).toBe("STRONG");
		expect(within(articleBody as HTMLElement).getByRole("list")).toBeInTheDocument();
		expect(within(articleBody as HTMLElement).getAllByRole("listitem")).toHaveLength(2);
	});

	it("renders a hierarchical table of contents linked to deterministic heading IDs", async () => {
		await renderMarkdown([
			"## 日本語の *見出し*",
			"",
			"### 子の `見出し`",
			"",
			"## 日本語の 見出し",
		].join("\n"));

		const navigation = screen.getByRole("navigation", { name: "目次" });
		expect(navigation).toHaveAttribute("data-pagefind-ignore");
		const matchingLinks = within(navigation).getAllByRole("link", { name: "日本語の 見出し" });
		const parentLink = matchingLinks[0];
		const childLink = within(navigation).getByRole("link", { name: "子の 見出し" });
		const duplicateLink = matchingLinks[1];

		expect(parentLink).toHaveAttribute("href", "#日本語の-見出し");
		expect(childLink).toHaveAttribute("href", "#子の-見出し");
		expect(within(parentLink.closest("li") as HTMLElement).getByRole("link", { name: "子の 見出し" })).toBe(childLink);
		expect(screen.getAllByRole("heading", { level: 2, name: "日本語の 見出し" })[0]).toHaveAttribute("id", "日本語の-見出し");
		expect(screen.getAllByRole("heading", { level: 2, name: "日本語の 見出し" })[1]).toHaveAttribute("id", "日本語の-見出し-1");
		expect(duplicateLink).toHaveAttribute("href", "#日本語の-見出し-1");
	});

	it("handles empty slugs and orphan h3 headings without inventing a parent", async () => {
		await renderMarkdown("### !!!\n\nText.\n\n### !!!");

		const navigation = screen.getByRole("navigation", { name: "目次" });
		const links = within(navigation).getAllByRole("link", { name: "!!!" });
		expect(links[0]).toHaveAttribute("href", "#section");
		expect(links[1]).toHaveAttribute("href", "#section-1");
		expect(links[0].closest("ul")).toBe(links[1].closest("ul"));
	});

	it("omits the table of contents when Markdown has no h2 or h3 headings", async () => {
		await renderMarkdown("#### Detail\n\nText.");

		expect(screen.queryByRole("navigation", { name: "目次" })).not.toBeInTheDocument();
	});

	it("renders inline and block mathematics with KaTeX", async () => {
		const { container } = await renderMarkdown("Euler: $e^{i\\pi}+1=0$\n\n$$\n\\int_0^1 x^2 dx\n$$");

		expect(container.querySelectorAll(".katex")).toHaveLength(2);
		expect(container.querySelector(".katex-display")).toHaveClass("math-block");
		expect(screen.getAllByText(/e|i|π|1|0/, { selector: ".katex-mathml *" }).length).toBeGreaterThan(0);
	});

	it("highlights fenced and language-marked inline code with Shiki", async () => {
		const { container } = await renderMarkdown(
			"Use `const answer = 42{:ts}`.\n\n```ts\nconst answer: number = 42;\n```\n\n```python\nprint('hello')\n```",
		);

		const highlightedBlocks = container.querySelectorAll("pre.shiki");
		expect(highlightedBlocks).toHaveLength(2);
		expect(highlightedBlocks[0]).toHaveTextContent("const answer: number = 42;");
		expect(highlightedBlocks[1]).toHaveTextContent("print('hello')");
		expect(container.querySelector("span.shiki")).toHaveTextContent("const answer = 42");
		expect(container.querySelectorAll(".shiki span[style]").length).toBeGreaterThan(0);
		expect(screen.getByText("typescript", { selector: ".code-label" })).toBeInTheDocument();
		expect(screen.getByText("python", { selector: ".code-label" })).toBeInTheDocument();
	});

	it("renders links and rewrites post-relative image paths", async () => {
		await renderMarkdown(
			"[Internal](/blog/2026/20260504-next) and [External](https://example.com).\n\n![Diagram](images/diagram.png \"Architecture\")\n\n<img src=\"images/raw.png\" alt=\"Raw diagram\">",
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
		expect(screen.getByRole("img", { name: "Raw diagram" })).toHaveAttribute(
			"src",
			"/post-assets/2026/20260503-learning-typescript/images/raw.png",
		);
	});

	it("keeps untitled images ordinary and unlabeled code fences unwrapped", async () => {
		const { container } = await renderMarkdown("```\nplain text\n```\n\n![Diagram](images/diagram.png)");

		expect(container.querySelector(".code-label")).not.toBeInTheDocument();
		expect(container.querySelector("figure")).not.toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Diagram" })).toBeInTheDocument();
	});

	it("rejects unsupported raw HTML and unsafe Markdown URLs", async () => {
		await expect(renderMarkdown('<script>alert("xss")</script>')).rejects.toThrow(/<script> is not allowed/);
		await expect(renderMarkdown("[Unsafe](javascript:alert(1))")).rejects.toThrow(/href uses an unsupported URL/);
	});

	it("renders native details while excluding their headings from the table of contents", async () => {
		const { container } = await renderMarkdown([
			"## Visible heading",
			"",
			"<details>",
			"<summary>Show example</summary>",
			"",
			"### Hidden heading",
			"",
			"- first",
			"- second",
			"",
			"```html",
			"<iframe src=\"https://example.com\"></iframe>",
			"```",
			"</details>",
		].join("\n"));

		const details = container.querySelector("details");
		expect(details).toBeInTheDocument();
		expect(details?.querySelector("summary")).toHaveTextContent("Show example");
		expect(details?.querySelector("h3")).toHaveTextContent("Hidden heading");
		expect(details?.querySelectorAll("li")).toHaveLength(2);
		expect(details?.querySelector("pre")).toHaveTextContent('<iframe src="https://example.com"></iframe>');
		expect(container.querySelector("iframe")).not.toBeInTheDocument();
		const navigation = screen.getByRole("navigation", { name: "目次" });
		expect(within(navigation).getByRole("link", { name: "Visible heading" })).toBeInTheDocument();
		expect(within(navigation).queryByRole("link", { name: "Hidden heading" })).not.toBeInTheDocument();
	});

	it("normalizes YouTube embeds and external media", async () => {
		const { container } = await renderMarkdown([
			'<iframe width="560" height="315" src="https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&start=10" title="YouTube video" allow="autoplay" allowfullscreen></iframe>',
			"",
			'<video src="https://media.example.com/movie.mp4" poster="https://media.example.com/poster.jpg" muted loop></video>',
			"",
			'<audio><source src="https://media.example.com/audio.mp3" type="audio/mpeg"></audio>',
		].join("\n"));

		const iframe = container.querySelector("iframe");
		expect(iframe).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?start=10&controls=1&playsinline=1");
		expect(iframe).toHaveAttribute("loading", "lazy");
		expect(iframe).toHaveAttribute("sandbox", "allow-same-origin allow-scripts allow-presentation");
		expect(iframe).not.toHaveAttribute("width");
		expect(iframe).not.toHaveAttribute("autoplay");

		const video = container.querySelector("video");
		expect(video).toHaveAttribute("controls");
		expect(video).toHaveAttribute("preload", "metadata");
		expect(video).toHaveProperty("muted", true);
		expect(video).toHaveAttribute("loop");
		const audio = container.querySelector("audio");
		expect(audio).toHaveAttribute("controls");
		expect(audio).toHaveAttribute("preload", "metadata");
		expect(audio?.querySelector("source")).toHaveAttribute("src", "https://media.example.com/audio.mp3");
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

		const card = screen.getByRole("link", { name: /Example preview/ });
		expect(card).toHaveClass("link-card");
		expect(card.querySelector(".link-card__copy")).toBeInTheDocument();
		expect(card.querySelector("img")).toHaveAttribute("src", "https://example.com/card.png");
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
		target.description = "Local derived description.";
		target.url = "/blog/2026/20260503-learning-typescript";
		await renderMarkdown("[Read this](/blog/2026/20260503-learning-typescript)", undefined, [target]);

		const card = screen.getByRole("link", { name: /Linked post/ });
		expect(card).toHaveClass("link-card");
		expect(card).toHaveAttribute("href", target.url);
		expect(screen.getByText("Local derived description.")).toBeInTheDocument();
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
