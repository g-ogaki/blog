import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";

afterEach(cleanup);

describe("Home", () => {
	it("renders the Japanese site introduction and latest published posts", () => {
		render(<Home />);

		expect(screen.getByRole("main")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 1, name: "学びの途中を、記録する。" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 2, name: "最新の記事" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "TypeScriptを学び始めました" })).toHaveAttribute(
			"href",
			"/blog/2026/20260503-learning-typescript",
		);
		expect(screen.queryByText("Rust学習メモ")).not.toBeInTheDocument();
	});

	it("includes a link to the full archive", () => {
		render(<Home />);

		expect(screen.getByRole("link", { name: "すべての記事を見る" })).toHaveAttribute("href", "/blog");
	});
});
