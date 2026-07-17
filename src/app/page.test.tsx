import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";

afterEach(cleanup);

describe("Home", () => {
	it("renders the profile, terminal introduction, and latest published posts", () => {
		render(<Home />);

		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "moni" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "最近の記事" })).toBeInTheDocument();
		expect(screen.getByLabelText("moniの自己紹介インタビュー")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "TypeScriptを学び始めました" })).toHaveAttribute(
			"href",
			"/blog/2026/20260503-learning-typescript",
		);
		expect(screen.queryByText("Rust学習メモ")).not.toBeInTheDocument();
	});

	it("uses the configured social destinations", () => {
		render(<Home />);

		expect(screen.getByRole("link", { name: "X (Twitter)" })).toHaveAttribute("href", "https://x.com/onakasuita_py");
		expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/g-ogaki");
	});

	it("includes a link to the full archive", () => {
		render(<Home />);

		expect(screen.getByRole("link", { name: "すべての記事を見る" })).toHaveAttribute("href", "/blog");
	});
});
