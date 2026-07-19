import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
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
	},
}];
const taxonomy = {
	categories: ["Programming"],
	months: ["2026-05"],
	tags: ["typescript", "learning"],
	years: ["2026"],
};

function createPosts(count: number) {
	return Array.from({ length: count }, (_, index) => ({
		...posts[0],
		url: `/blog/2026/post-${index + 1}`,
		metadata: { ...posts[0].metadata, title: `記事${index + 1}` },
	}));
}

function visibleRows(container: HTMLElement) {
	return container.querySelectorAll(".post-row:not(.post-row--deferred)");
}

function pagefindResults(resultPosts: ReturnType<typeof createPosts>) {
	return resultPosts.map((post) => ({ data: vi.fn().mockResolvedValue({
		meta: { ...post.metadata, tags: post.metadata.tags.join(","), url: post.url },
		plain_excerpt: "記事の検索抜粋です。",
		url: post.url,
	}) }));
}

afterEach(() => {
	cleanup();
	pagefind.load.mockReset();
	window.history.replaceState(null, "", "/");
});

describe("SearchArchive", () => {
	function mockPagefind() {
		const search = vi.fn().mockResolvedValue({ results: [] });
		pagefind.load.mockResolvedValue({
			init: vi.fn().mockResolvedValue(undefined),
			filters: vi.fn().mockResolvedValue({}),
			search,
		});
		return search;
	}

	it("keeps incremental loading available when Pagefind cannot load", async () => {
		const fallbackPosts = createPosts(5);
		pagefind.load.mockRejectedValue(new Error("missing index"));
		const { container } = render(<SearchArchive posts={fallbackPosts} taxonomy={taxonomy} />);

		expect(await screen.findByText("検索を利用できません。すべての記事を表示しています。")).toBeInTheDocument();
		expect(visibleRows(container)).toHaveLength(2);
		fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }));
		expect(visibleRows(container)).toHaveLength(4);
	});

	it("keeps every post in static HTML without rendering a nonfunctional control", () => {
		const html = renderToStaticMarkup(<SearchArchive posts={createPosts(5)} taxonomy={taxonomy} />);

		for (let index = 1; index <= 5; index += 1) expect(html).toContain(`記事${index}`);
		expect(html.match(/post-row--deferred/gu)).toHaveLength(3);
		expect(html).not.toContain("さらに読み込む");
	});

	it("offers incremental loading before Pagefind finishes initializing", async () => {
		pagefind.load.mockReturnValue(new Promise(() => {}));
		render(<SearchArchive posts={createPosts(5)} taxonomy={taxonomy} />);

		expect(await screen.findByText("5件中2件を表示")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "さらに読み込む" })).toBeInTheDocument();
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

	it("keeps year and month filters mutually exclusive", async () => {
		const search = mockPagefind();
		render(<SearchArchive posts={posts} taxonomy={taxonomy} />);
		await screen.findByText("全1件");

		fireEvent.click(screen.getByRole("link", { name: "2026年" }));
		await waitFor(() => expect(window.location.search).toBe("?year=2026"));

		fireEvent.click(screen.getByRole("link", { name: "2026年5月" }));
		await waitFor(() => {
			expect(window.location.search).toBe("?month=2026-05");
			expect(search).toHaveBeenLastCalledWith(null, { filters: { month: "2026-05" } });
		});

		fireEvent.click(screen.getByRole("link", { name: "2026年" }));
		await waitFor(() => {
			expect(window.location.search).toBe("?year=2026");
			expect(search).toHaveBeenLastCalledWith(null, { filters: { year: "2026" } });
		});
	});

	it("clears an active category without an all-categories option", async () => {
		mockPagefind();
		render(<SearchArchive posts={posts} taxonomy={taxonomy} />);
		await screen.findByText("全1件");

		expect(screen.queryByRole("link", { name: "すべて" })).not.toBeInTheDocument();
		const category = screen.getByRole("link", { name: "Programming" });
		fireEvent.click(category);
		expect(window.location.search).toBe("?category=Programming");

		fireEvent.click(category);
		expect(window.location.pathname).toBe("/blog");
		expect(window.location.search).toBe("");
	});

	it("selects multiple tags with AND semantics and clears them independently", async () => {
		const search = mockPagefind();
		render(<SearchArchive posts={posts} taxonomy={taxonomy} />);
		await screen.findByText("全1件");

		const typescript = screen.getByRole("link", { name: "typescript" });
		const learning = screen.getByRole("link", { name: "learning" });
		fireEvent.click(typescript);
		await waitFor(() => {
			expect(window.location.search).toBe("?tag=typescript");
			expect(search).toHaveBeenLastCalledWith(null, { filters: { tag: ["typescript"] } });
		});

		expect(learning).toHaveAttribute("href", "/blog?tag=typescript&tag=learning");
		fireEvent.click(learning);
		await waitFor(() => {
			expect(window.location.search).toBe("?tag=typescript&tag=learning");
			expect(search).toHaveBeenLastCalledWith(null, { filters: { tag: ["typescript", "learning"] } });
			expect(typescript).toHaveAttribute("aria-current", "true");
			expect(learning).toHaveAttribute("aria-current", "true");
		});

		fireEvent.click(typescript);
		await waitFor(() => {
			expect(window.location.search).toBe("?tag=learning");
			expect(search).toHaveBeenLastCalledWith(null, { filters: { tag: ["learning"] } });
			expect(typescript).not.toHaveAttribute("aria-current");
			expect(learning).toHaveAttribute("aria-current", "true");
		});
	});

	it("reveals matching articles in batches of two and resets when criteria change", async () => {
		const manyPosts = createPosts(5);
		pagefind.load.mockResolvedValue({
			init: vi.fn().mockResolvedValue(undefined),
			filters: vi.fn().mockResolvedValue({}),
			search: vi.fn().mockResolvedValue({ results: pagefindResults(manyPosts) }),
		});
		const { container } = render(<SearchArchive posts={manyPosts} taxonomy={taxonomy} />);

		await screen.findByText("全5件");
		expect(visibleRows(container)).toHaveLength(2);
		expect(screen.getByText("5件中2件を表示")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }));
		expect(visibleRows(container)).toHaveLength(4);
		expect(screen.getByText("5件中4件を表示")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }));
		expect(visibleRows(container)).toHaveLength(5);
		expect(screen.queryByRole("button", { name: "さらに読み込む" })).not.toBeInTheDocument();
		expect(screen.queryByText(/5件中/)).not.toBeInTheDocument();

		fireEvent.change(screen.getByRole("searchbox", { name: "記事を検索" }), { target: { value: "記事" } });
		await waitFor(() => expect(visibleRows(container)).toHaveLength(2));
		expect(screen.getByText("5件中2件を表示")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "さらに読み込む" }));
		expect(visibleRows(container)).toHaveLength(4);
		fireEvent.click(screen.getByRole("link", { name: "Programming" }));
		await waitFor(() => expect(visibleRows(container)).toHaveLength(2));
	});
});
