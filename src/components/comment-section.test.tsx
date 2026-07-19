import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommentSection } from "./comment-section";

const postSlug = "2026/20260503-learning-typescript";

function turnstile() {
	let callback: ((token: string) => void) | undefined;
	const api = {
		remove: vi.fn(),
		render: vi.fn((_container, options) => {
			callback = options.callback;
			return "widget-id";
		}),
		reset: vi.fn(),
	};
	return { api, solve: () => act(() => callback?.("verified-token")) };
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("CommentSection", () => {
	it("renders approved comments as plain text and submits a verified comment", async () => {
		const fetchMock = vi.fn()
			.mockResolvedValueOnce(Response.json({
				comments: [{
					comment: "<img src=x onerror=alert(1)>\nSecond line",
					created_at: "2026-07-14T03:00:00.000Z",
					id: 1,
					name: "Ada",
				}],
			}))
			.mockResolvedValueOnce(Response.json({ success: true }, { status: 201 }));
		vi.stubGlobal("fetch", fetchMock);
		const widget = turnstile();

		render(<CommentSection postSlug={postSlug} siteKey="site-key" turnstileApi={widget.api} />);

		const body = await screen.findByText(/<img src=x/);
		expect(body).toHaveClass("comment-body");
		expect(body.textContent).toBe("<img src=x onerror=alert(1)>\nSecond line");
		expect(body.querySelector("img")).toBeNull();

		widget.solve();
		fireEvent.change(screen.getByRole("textbox", { name: "名前" }), { target: { value: "Grace" } });
		fireEvent.change(screen.getByRole("textbox", { name: "コメント" }), { target: { value: "Hello\nWorld" } });
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		expect(await screen.findByRole("status")).toHaveTextContent("承認後に表示されます");
		const [, request] = fetchMock.mock.calls[1];
		expect(JSON.parse(request.body)).toEqual({
			comment: "Hello\nWorld",
			locale: "ja",
			name: "Grace",
			post_slug: postSlug,
			turnstile_token: "verified-token",
		});
		expect(widget.api.reset).toHaveBeenCalledWith("widget-id");
	});

	it("reports rate limiting and refreshes the single-use Turnstile token", async () => {
		const fetchMock = vi.fn()
			.mockResolvedValueOnce(Response.json({ comments: [] }))
			.mockResolvedValueOnce(Response.json({ success: false }, { status: 429 }));
		vi.stubGlobal("fetch", fetchMock);
		const widget = turnstile();
		render(<CommentSection postSlug={postSlug} siteKey="site-key" turnstileApi={widget.api} />);

		await waitFor(() => expect(widget.api.render).toHaveBeenCalled());
		const emptyComment = await screen.findByText("まだコメントはありません。");
		expect(emptyComment.closest("ol")).toHaveClass("comment-list");
		widget.solve();
		fireEvent.change(screen.getByRole("textbox", { name: "名前" }), { target: { value: "Ada" } });
		fireEvent.change(screen.getByRole("textbox", { name: "コメント" }), { target: { value: "Hello" } });
		fireEvent.click(screen.getByRole("button", { name: "送信" }));

		expect(await screen.findByRole("alert")).toHaveTextContent("本日の投稿上限");
		expect(widget.api.reset).toHaveBeenCalledWith("widget-id");
		expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
	});
});
