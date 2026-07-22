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
		const featuredPost = screen.getByRole("link", { name: "このサイトは Vibe code と Vibe design で作られています" });
		expect(featuredPost).toHaveAttribute(
			"href",
			"/blog/2026/20260721-vibe-code-and-design",
		);
		expect(screen.getByRole("link", { name: "科学するミックスボイス 3. フォーマントチューニング" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "包除原理の簡単な証明" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "科学するミックスボイス 2. TA筋とCT筋" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "科学するミックスボイス 1. 解剖生理学" })).toBeInTheDocument();
		expect(screen.queryByText("読みやすい技術記事の余白を考える")).not.toBeInTheDocument();
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
