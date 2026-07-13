import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

afterEach(cleanup);

describe("SiteHeader", () => {
	it("provides the site identity and primary navigation", () => {
		render(<SiteHeader />);

		expect(screen.getByRole("link", { name: "moni's page" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("navigation", { name: "メインナビゲーション" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "ブログ" })).toHaveAttribute("href", "/blog");
	});
});
