import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchArchive } from "./search-archive";

const pagefind = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock("@/lib/pagefind-client", () => ({ loadPagefind: pagefind.load }));

const posts = [{
	url: "/blog/2026/20260503-learning-typescript",
	metadata: {
		title: "TypeScriptを学び始めました",
		date: "2026-05-03",
		category: "Programming",
		tags: ["typescript"],
		summary: "TypeScriptの学習記録です。",
	},
}];
const taxonomy = {
	categories: ["Programming"],
	months: ["2026-05"],
	tags: ["typescript"],
	years: ["2026"],
};

afterEach(() => {
	cleanup();
	pagefind.load.mockReset();
	window.history.replaceState(null, "", "/");
});

describe("SearchArchive", () => {
	it("keeps the published list available when Pagefind cannot load", async () => {
		pagefind.load.mockRejectedValue(new Error("missing index"));
		render(<SearchArchive posts={posts} taxonomy={taxonomy} />);

		expect(await screen.findByText("検索を利用できません。すべての記事を表示しています。")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "TypeScriptを学び始めました" })).toBeInTheDocument();
	});

	it("reports an empty result without hiding the search controls", async () => {
		pagefind.load.mockResolvedValue({
			init: vi.fn().mockResolvedValue(undefined),
			filters: vi.fn().mockResolvedValue({}),
			search: vi.fn().mockResolvedValue({ results: [] }),
		});
		render(<SearchArchive posts={posts} taxonomy={taxonomy} />);
		const input = screen.getByRole("searchbox", { name: "記事を検索" });
		await waitFor(() => expect(input).toBeEnabled());

		fireEvent.change(input, { target: { value: "not-found" } });

		expect(await screen.findByText("条件に一致する記事はありません。")).toBeInTheDocument();
		expect(input).toBeEnabled();
	});

	it("uses canonical metadata instead of Pagefind's generated HTML path", async () => {
		pagefind.load.mockResolvedValue({
			init: vi.fn().mockResolvedValue(undefined),
			filters: vi.fn().mockResolvedValue({}),
			search: vi.fn().mockResolvedValue({
				results: [{ data: vi.fn().mockResolvedValue({
					meta: { title: "検索結果", url: "/blog/2026/canonical-post" },
					plain_excerpt: "概要",
					url: "/blog/2026/canonical-post.html",
				}) }],
			}),
		});
		render(<SearchArchive posts={posts} taxonomy={taxonomy} />);
		const input = screen.getByRole("searchbox", { name: "記事を検索" });
		await waitFor(() => expect(input).toBeEnabled());

		fireEvent.change(input, { target: { value: "検索" } });

		expect(await screen.findByRole("link", { name: "検索結果" })).toHaveAttribute(
			"href",
			"/blog/2026/canonical-post",
		);
	});
});
