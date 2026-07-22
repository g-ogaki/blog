import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BlogPage } from "@/components/blog-page";
import { generatePostMetadata, generatePostStaticParams, LocalizedPostPage } from "@/components/localized-post-page";

afterEach(() => {
	cleanup();
	vi.unstubAllEnvs();
});

describe("blog routes", () => {
	it("lists only English translations on the English archive", () => {
		render(<BlogPage locale="en" />);
		expect(screen.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "This Site Was Built with Vibe Coding and Vibe Design" })).toHaveAttribute(
			"href",
			"/en/blog/2026/20260721-vibe-code-and-design",
		);
		expect(screen.queryByText("このサイトは Vibe code と Vibe design で作られています")).not.toBeInTheDocument();
	});

	it("lists published posts without drafts", () => {
		render(<BlogPage locale="ja" />);

		expect(screen.getByRole("link", { name: "このサイトは Vibe code と Vibe design で作られています" })).toHaveAttribute(
			"href",
			"/blog/2026/20260721-vibe-code-and-design",
		);
		expect(screen.queryByText("読みやすい技術記事の余白を考える")).not.toBeInTheDocument();
	});

	it("renders taxonomy navigation with stable filter URLs", () => {
		render(<BlogPage locale="ja" />);

		expect(screen.getByRole("navigation", { name: "記事の分類" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Programming" })).toHaveAttribute(
			"href",
			"/blog?category=Programming",
		);
		expect(screen.getByRole("link", { name: "Codex" })).toHaveAttribute("href", "/blog?tag=Codex");
		expect(screen.getByRole("link", { name: "2026年" })).toHaveAttribute("href", "/blog?year=2026");
		expect(screen.getByRole("link", { name: "2026年7月" })).toHaveAttribute("href", "/blog?month=2026-07");
	});

	it("generates parameters only for published posts", () => {
		expect(generatePostStaticParams("ja")).toEqual([
			{ year: "2026", post: "20260721-vibe-code-and-design" },
			{ year: "2026", post: "20260716-mix-voice-3" },
			{ year: "2026", post: "20260710-include-exclude-principle" },
			{ year: "2026", post: "20260703-mix-voice-2" },
			{ year: "2026", post: "20260616-mix-voice-1" },
			{ year: "2026", post: "20260530-le-gall" },
		]);
	});

	it("adds draft article routes only in local development", () => {
		vi.stubEnv("NODE_ENV", "development");

		expect(generatePostStaticParams("ja")).toContainEqual({
			post: "20260716-article-spacing",
			year: "2026",
		});
	});

	it("renders a published post as an article", async () => {
		const element = await LocalizedPostPage({ locale: "ja", params: Promise.resolve({ year: "2026", post: "20260721-vibe-code-and-design" }) });
		render(element);

		expect(screen.getByRole("article")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "このサイトは Vibe code と Vibe design で作られています" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "事前知識" })).toBeInTheDocument();
		expect(screen.getByRole("article")).toHaveAttribute("data-pagefind-body", "");
		expect(screen.getByRole("article")).toHaveAttribute(
			"data-pagefind-filter",
			"category[data-category], year[data-year], month[data-month]",
		);
		expect(screen.getByRole("article")).toHaveAttribute("data-url", "/blog/2026/20260721-vibe-code-and-design");
		expect(screen.getByRole("article")).toHaveAttribute("data-description");
		expect(screen.getByRole("article").getAttribute("data-description")).toMatch(/^Codex CLI を使った初めての AI コーディングにて/);
		expect(screen.getByRole("article")).toHaveAttribute(
			"data-pagefind-meta",
			"category[data-category], tags[data-tags], date[data-date], url[data-url], description[data-description], image[data-image]",
		);
		expect(screen.getByRole("article")).toHaveAttribute("data-image", "/post-assets/2026/20260721-vibe-code-and-design/awtf2026.jpeg");
		expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("data-pagefind-meta", "title");
		expect(document.querySelector('[data-pagefind-filter="tag"]')).toHaveTextContent("Codex");
		expect(screen.queryByRole("complementary", { name: "Translation notice" })).not.toBeInTheDocument();
	});

	it("generates canonical and post-specific Open Graph metadata", async () => {
		const metadata = await generatePostMetadata("ja", Promise.resolve({ year: "2026", post: "20260721-vibe-code-and-design" }));

		expect(metadata.alternates?.canonical).toBe("/blog/2026/20260721-vibe-code-and-design");
		expect(metadata.description).toMatch(/^Codex CLI を使った初めての AI コーディングにて/);
		expect(metadata.openGraph).toMatchObject({
			type: "article",
			description: metadata.description,
			images: ["/post-assets/2026/20260721-vibe-code-and-design/awtf2026.jpeg"],
		});
		expect(metadata.alternates?.languages).toMatchObject({
			ja: "/blog/2026/20260721-vibe-code-and-design",
			en: "/en/blog/2026/20260721-vibe-code-and-design",
		});
	});

	it("renders and describes the English translation independently", async () => {
		const params = Promise.resolve({ year: "2026", post: "20260721-vibe-code-and-design" });
		render(await LocalizedPostPage({ locale: "en", params }));
		expect(screen.getByRole("heading", { level: 1, name: "This Site Was Built with Vibe Coding and Vibe Design" })).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
		const notice = screen.getByRole("complementary", { name: "Translation notice" });
		expect(notice).toHaveTextContent("This English version was translated from the original Japanese article using AI and may contain inaccuracies.");
		expect(notice).toHaveAttribute("data-pagefind-ignore", "");
		expect(notice).toHaveAttribute("lang", "en");
		expect(screen.getByRole("link", { name: "original Japanese article" })).toHaveAttribute(
			"href",
			"/blog/2026/20260721-vibe-code-and-design",
		);
		const metadata = await generatePostMetadata("en", Promise.resolve({ year: "2026", post: "20260721-vibe-code-and-design" }));
		expect(metadata.alternates?.canonical).toBe("/en/blog/2026/20260721-vibe-code-and-design");
		expect(metadata.openGraph).toMatchObject({ locale: "en_US", alternateLocale: ["ja_JP"] });
	});
});
