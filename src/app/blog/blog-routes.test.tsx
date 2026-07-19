import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BlogPage } from "@/components/blog-page";
import { generatePostMetadata, generatePostStaticParams, LocalizedPostPage } from "@/components/localized-post-page";

afterEach(cleanup);

describe("blog routes", () => {
	it("lists only English translations on the English archive", () => {
		render(<BlogPage locale="en" />);
		expect(screen.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Getting Started with TypeScript" })).toHaveAttribute(
			"href",
			"/en/blog/2026/20260503-learning-typescript",
		);
		expect(screen.queryByText("Rustの所有権を小さなコードで確かめる")).not.toBeInTheDocument();
	});

	it("lists published posts without drafts", () => {
		render(<BlogPage locale="ja" />);

		expect(screen.getByRole("link", { name: "TypeScriptを学び始めました" })).toHaveAttribute(
			"href",
			"/blog/2026/20260503-learning-typescript",
		);
		expect(screen.queryByText("Rust学習メモ")).not.toBeInTheDocument();
	});

	it("renders taxonomy navigation with stable filter URLs", () => {
		render(<BlogPage locale="ja" />);

		expect(screen.getByRole("navigation", { name: "記事の分類" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Programming" })).toHaveAttribute(
			"href",
			"/blog?category=Programming",
		);
		expect(screen.getByRole("link", { name: "typescript" })).toHaveAttribute("href", "/blog?tag=typescript");
		expect(screen.getByRole("link", { name: "2026年" })).toHaveAttribute("href", "/blog?year=2026");
		expect(screen.getByRole("link", { name: "2026年6月" })).toHaveAttribute("href", "/blog?month=2026-06");
	});

	it("generates parameters only for published posts", () => {
		expect(generatePostStaticParams("ja")).toEqual([
			{ year: "2026", post: "20260716-article-spacing" },
			{ year: "2026", post: "20260702-math-as-prose" },
			{ year: "2026", post: "20260618-quiet-blog-renewal" },
			{ year: "2026", post: "20260605-hoge-huga" },
			{ year: "2026", post: "20260503-learning-typescript" },
		]);
	});

	it("renders a published post as an article", async () => {
		const element = await LocalizedPostPage({ locale: "ja", params: Promise.resolve({ year: "2026", post: "20260503-learning-typescript" }) });
		render(element);

		expect(screen.getByRole("article")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "TypeScriptを学び始めました" })).toBeInTheDocument();
		expect(document.querySelector("pre")).toHaveTextContent("const answer: Answer");
		expect(screen.getByRole("article")).toHaveAttribute("data-pagefind-body", "");
		expect(screen.getByRole("article")).toHaveAttribute(
			"data-pagefind-filter",
			"category[data-category], year[data-year], month[data-month]",
		);
		expect(screen.getByRole("article")).toHaveAttribute("data-url", "/blog/2026/20260503-learning-typescript");
		expect(screen.getByRole("article")).toHaveAttribute("data-description");
		expect(screen.getByRole("article").getAttribute("data-description")).toMatch(/^このサイトのコンテンツ読み込みを確認するため/);
		expect(screen.getByRole("article")).toHaveAttribute(
			"data-pagefind-meta",
			"category[data-category], tags[data-tags], date[data-date], url[data-url], description[data-description], image[data-image]",
		);
		expect(screen.getByRole("article")).toHaveAttribute("data-image", "/post-assets/2026/20260503-learning-typescript/cat.png");
		expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("data-pagefind-meta", "title");
		expect(document.querySelector('[data-pagefind-filter="tag"]')).toHaveTextContent("typescript");
		expect(screen.queryByRole("complementary", { name: "Translation notice" })).not.toBeInTheDocument();
	});

	it("generates canonical and post-specific Open Graph metadata", async () => {
		const metadata = await generatePostMetadata("ja", Promise.resolve({ year: "2026", post: "20260503-learning-typescript" }));

		expect(metadata.alternates?.canonical).toBe("/blog/2026/20260503-learning-typescript");
		expect(metadata.description).toMatch(/^このサイトのコンテンツ読み込みを確認するため/);
		expect(metadata.openGraph).toMatchObject({
			type: "article",
			description: metadata.description,
			images: ["/post-assets/2026/20260503-learning-typescript/cat.png"],
		});
		expect(metadata.alternates?.languages).toMatchObject({
			ja: "/blog/2026/20260503-learning-typescript",
			en: "/en/blog/2026/20260503-learning-typescript",
		});
	});

	it("renders and describes the English translation independently", async () => {
		const params = Promise.resolve({ year: "2026", post: "20260503-learning-typescript" });
		render(await LocalizedPostPage({ locale: "en", params }));
		expect(screen.getByRole("heading", { level: 1, name: "Getting Started with TypeScript" })).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
		const notice = screen.getByRole("complementary", { name: "Translation notice" });
		expect(notice).toHaveTextContent("This English version was translated from the original Japanese article using AI and may contain inaccuracies.");
		expect(notice).toHaveAttribute("data-pagefind-ignore", "");
		expect(notice).toHaveAttribute("lang", "en");
		expect(screen.getByRole("link", { name: "original Japanese article" })).toHaveAttribute(
			"href",
			"/blog/2026/20260503-learning-typescript",
		);
		const metadata = await generatePostMetadata("en", Promise.resolve({ year: "2026", post: "20260503-learning-typescript" }));
		expect(metadata.alternates?.canonical).toBe("/en/blog/2026/20260503-learning-typescript");
		expect(metadata.openGraph).toMatchObject({ locale: "en_US", alternateLocale: ["ja_JP"] });
	});
});
