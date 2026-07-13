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

	it("generates parameters only for published posts", () => {
		expect(generateStaticParams()).toEqual([
			{ year: "2026", post: "20260503-learning-typescript" },
		]);
	});

	it("renders a published post as an article", async () => {
		const element = await PostPage({ params: Promise.resolve({ year: "2026", post: "20260503-learning-typescript" }) });
		render(element);

		expect(screen.getByRole("article")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "TypeScriptを学び始めました" })).toBeInTheDocument();
		expect(document.querySelector("pre")).toHaveTextContent("const answer: Answer");
	});

	it("generates canonical and fallback Open Graph metadata", async () => {
		const metadata = await generateMetadata({
			params: Promise.resolve({ year: "2026", post: "20260503-learning-typescript" }),
		});

		expect(metadata.alternates?.canonical).toBe("/blog/2026/20260503-learning-typescript");
		expect(metadata.description).toBe("TypeScriptの型を試しながら学ぶためのサンプル記事です。");
		expect(metadata.openGraph).toMatchObject({
			type: "article",
			images: ["/cat.jpg"],
		});
	});
});
