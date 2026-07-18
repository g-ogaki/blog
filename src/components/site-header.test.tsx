import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

beforeEach(() => {
	route.pathname = "/";
	localStorage.clear();
	document.documentElement.removeAttribute("data-theme");
});

afterEach(cleanup);

describe("SiteHeader", () => {
	it("provides route-aware identity, navigation, and static search", () => {
		render(<SiteHeader />);

		expect(screen.getByRole("link", { name: "moni's page" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute("aria-current", "page");
		expect(screen.getByRole("searchbox", { name: "ブログを検索" })).toHaveAttribute("name", "q");
	});

	it("omits duplicate search on the archive and marks Blog current", () => {
		route.pathname = "/blog";
		render(<SiteHeader />);

		expect(screen.getByRole("link", { name: "ブログ" })).toHaveAttribute("aria-current", "page");
		expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
	});

	it("exposes language availability and applies a selected theme", () => {
		const { container } = render(<SiteHeader />);

		expect(container.querySelector(".theme-icon--sun")).toBeInTheDocument();
		expect(container.querySelector(".theme-icon--moon")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "表示言語を変更" }));
		expect(screen.getByRole("menuitemradio", { name: /日本語/ })).toHaveAttribute("aria-checked", "true");
		expect(screen.getByRole("menuitemradio", { name: /English/ })).toHaveAttribute("aria-disabled", "true");

		fireEvent.click(screen.getByRole("button", { name: "表示テーマを変更" }));
		fireEvent.click(screen.getByRole("menuitemradio", { name: /ダーク/ }));
		expect(document.documentElement).toHaveAttribute("data-theme", "dark");
		expect(localStorage.getItem("theme")).toBe("dark");
		expect(container.querySelector(".theme-icon--sun")).toBeInTheDocument();
		expect(container.querySelector(".theme-icon--moon")).toBeInTheDocument();
	});

	it("closes a menu with Escape and restores trigger focus", async () => {
		render(<SiteHeader />);
		const trigger = screen.getByRole("button", { name: "表示テーマを変更" });
		fireEvent.keyDown(trigger, { key: "ArrowDown" });
		const menu = screen.getByRole("menu", { name: "表示テーマ" });

		fireEvent.keyDown(menu, { key: "Escape" });

		expect(screen.queryByRole("menu", { name: "表示テーマ" })).not.toBeInTheDocument();
		await waitFor(() => expect(trigger).toHaveFocus());
	});
});
