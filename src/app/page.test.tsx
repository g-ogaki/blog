import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HomePage } from "@/components/home-page";

afterEach(cleanup);

describe("Home", () => {
	it("renders the profile, terminal introduction, and latest published posts", () => {
		render(<HomePage locale="ja" />);

		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "moni" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "最近の記事" })).toBeInTheDocument();
		expect(screen.getByLabelText("moniの自己紹介インタビュー")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "TypeScriptを学び始めました" })).toHaveAttribute(
			"href",
			"/blog/2026/20260503-learning-typescript",
		);
		const mathematicsPost = screen.getByRole("link", { name: "数式を文章の一部として配置する" });
		const diaryPost = screen.getByRole("link", { name: "静かな個人ブログを作り直した記録" });
		expect(mathematicsPost.querySelector("img")).toHaveAttribute(
			"src",
			"/post-assets/2026/20260702-math-as-prose/cat.jpg",
		);
		expect(diaryPost.querySelector("img")).toHaveAttribute(
			"src",
			"/post-assets/2026/20260618-quiet-blog-renewal/cat.jpg",
		);
		expect(screen.getByRole("link", { name: "Rustの所有権を小さなコードで確かめる" })).toBeInTheDocument();
		expect(screen.queryByText("Rust学習メモ")).not.toBeInTheDocument();
	});

	it("uses the configured social destinations", () => {
		render(<HomePage locale="ja" />);

		const x = screen.getByRole("link", { name: "X (Twitter)" });
		const github = screen.getByRole("link", { name: "GitHub" });
		expect(x).toHaveAttribute("href", "https://x.com/onakasuita_py");
		expect(x).toHaveAttribute("target", "_blank");
		expect(x).toHaveAttribute("rel", "noopener noreferrer");
		expect(github).toHaveAttribute("href", "https://github.com/g-ogaki");
		expect(github).toHaveAttribute("target", "_blank");
		expect(github).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("includes a link to the full archive", () => {
		render(<HomePage locale="ja" />);

		expect(screen.getByRole("link", { name: "すべての記事を見る" })).toHaveAttribute("href", "/blog");
	});
});
