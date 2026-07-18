import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import BlogPage from "./page";
import PostPage, { generateMetadata, generateStaticParams } from "./[year]/[post]/page";

afterEach(cleanup);

describe("blog routes", () => {
	it("lists published posts without drafts", () => {
		render(<BlogPage />);

		expect(screen.getByRole("link", { name: "TypeScriptを学び始めました" })).toHaveAttribute(
			"href",
			"/blog/2026/20260503-learning-typescript",
		);
		expect(screen.queryByText("Rust学習メモ")).not.toBeInTheDocument();
	});

	it("renders taxonomy navigation with stable filter URLs", () => {
		render(<BlogPage />);

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
		expect(generateStaticParams()).toEqual([
			{ year: "2026", post: "20260716-article-spacing" },
			{ year: "2026", post: "20260702-math-as-prose" },
			{ year: "2026", post: "20260618-quiet-blog-renewal" },
			{ year: "2026", post: "20260605-hoge-huga" },
			{ year: "2026", post: "20260503-learning-typescript" },
		]);
	});

	it("renders a published post as an article", async () => {
		const element = await PostPage({ params: Promise.resolve({ year: "2026", post: "20260503-learning-typescript" }) });
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
		expect(screen.getByRole("article")).toHaveAttribute("data-summary", "型を小さく試しながら、学んだことを記録した記事です。");
		expect(screen.getByRole("article")).toHaveAttribute("data-image", "/post-assets/2026/20260503-learning-typescript/cat.png");
		expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("data-pagefind-meta", "title");
		expect(document.querySelector('[data-pagefind-filter="tag"]')).toHaveTextContent("typescript");
	});

	it("generates canonical and post-specific Open Graph metadata", async () => {
		const metadata = await generateMetadata({
			params: Promise.resolve({ year: "2026", post: "20260503-learning-typescript" }),
		});

		expect(metadata.alternates?.canonical).toBe("/blog/2026/20260503-learning-typescript");
		expect(metadata.description).toBe("型を小さく試しながら、学んだことを記録した記事です。");
		expect(metadata.openGraph).toMatchObject({
			type: "article",
			images: ["/post-assets/2026/20260503-learning-typescript/cat.png"],
		});
	});
});
