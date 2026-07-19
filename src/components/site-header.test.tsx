import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSuggestion, SiteHeader } from "./site-header";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

beforeEach(() => {
	route.pathname = "/";
	localStorage.clear();
	document.cookie = "site_locale=; Max-Age=0; Path=/";
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

	it("localizes English navigation and links translated and untranslated articles correctly", () => {
		route.pathname = "/en/blog/2026/20260503-learning-typescript";
		render(<SiteHeader locale="en" />);
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/en");
		fireEvent.click(screen.getByRole("button", { name: "Change display language" }));
		expect(screen.getByRole("menuitemradio", { name: /日本語/ })).toHaveAttribute(
			"href",
			"/language/ja?redirect=%2Fblog%2F2026%2F20260503-learning-typescript",
		);
		cleanup();
		route.pathname = "/blog/2026/20260702-math-as-prose";
		render(<SiteHeader locale="ja" />);
		fireEvent.click(screen.getByRole("button", { name: "表示言語を変更" }));
		expect(screen.getByRole("menuitemradio", { name: /English/ })).toHaveAttribute(
			"href",
			"/language/en?redirect=%2Fblog%2F2026%2F20260702-math-as-prose",
		);
	});

	it("keeps an untranslated Japanese article and shows an English notice without an archive link", () => {
		route.pathname = "/blog/2026/20260702-math-as-prose";
		document.cookie = "site_locale=en; Path=/";
		render(<LanguageSuggestion locale="ja" />);

		expect(screen.getByText("This article is not available in English.")).toHaveAttribute("lang", "en");
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Dismiss language suggestion" })).toBeInTheDocument();
	});

	it("offers an English counterpart in English when the translation exists", () => {
		route.pathname = "/blog/2026/20260503-learning-typescript";
		document.cookie = "site_locale=en; Path=/";
		render(<LanguageSuggestion locale="ja" />);

		expect(screen.getByRole("link", { name: "Read this page in English" })).toHaveAttribute(
			"href",
			"/language/en?redirect=%2Fen%2Fblog%2F2026%2F20260503-learning-typescript",
		);
	});

	it("exposes language availability and applies a selected theme", () => {
		const { container } = render(<SiteHeader />);

		expect(container.querySelector(".theme-icon--sun")).toBeInTheDocument();
		expect(container.querySelector(".theme-icon--moon")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "表示言語を変更" }));
		expect(screen.getByRole("menuitemradio", { name: /日本語/ })).toHaveAttribute("aria-checked", "true");
		expect(screen.getByRole("menuitemradio", { name: /English/ })).toHaveAttribute(
			"href",
			"/language/en?redirect=%2Fen",
		);

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
