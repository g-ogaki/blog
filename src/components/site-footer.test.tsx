import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

afterEach(cleanup);

describe("SiteFooter", () => {
	it("opens social links in new tabs and keeps the feed in the current tab", () => {
		render(<SiteFooter />);

		const x = screen.getByRole("link", { name: "X (Twitter)" });
		const github = screen.getByRole("link", { name: "GitHub" });
		expect(x).toHaveAttribute("target", "_blank");
		expect(x).toHaveAttribute("rel", "noopener noreferrer");
		expect(github).toHaveAttribute("target", "_blank");
		expect(github).toHaveAttribute("rel", "noopener noreferrer");
		expect(screen.getByRole("link", { name: "Feed" })).not.toHaveAttribute("target");
	});
});
