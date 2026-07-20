import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeTerminal } from "./home-terminal";

const encoder = new TextEncoder();

function chatResponse(answer = "サイトの記事を案内します。", sources = [{ locale: "ja", title: "記事", url: "https://monipy.org/blog/2026/post" }]) {
	const body = [
		`event: sources\ndata: ${JSON.stringify({ sources })}\n\n`,
		`event: delta\ndata: ${JSON.stringify({ text: answer })}\n\n`,
		"event: done\ndata: {}\n\n",
	];
	return new Response(new ReadableStream({
		start(controller) {
			for (const part of body) controller.enqueue(encoder.encode(part));
			controller.close();
		},
	}), { headers: { "content-type": "text/event-stream" } });
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
		addEventListener: vi.fn(),
		addListener: vi.fn(),
		dispatchEvent: vi.fn(),
		matches: false,
		media: query,
		onchange: null,
		removeEventListener: vi.fn(),
		removeListener: vi.fn(),
	}));
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue(chatResponse()));
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("HomeTerminal", () => {
	it("server-renders the complete interview with a disabled no-JavaScript input", () => {
		render(<HomeTerminal />);

		expect(screen.getByText("こんにちは。")).toBeInTheDocument();
		expect(screen.getByText(/レイリー散乱/)).toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: "メッセージを入力" })).toBeDisabled();
		expect(screen.getByPlaceholderText("自由入力には JavaScript が必要です")).toBeInTheDocument();
	});

	it("enables input immediately for reduced motion and renders visitor text safely", async () => {
		vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
			addEventListener: vi.fn(),
			addListener: vi.fn(),
			dispatchEvent: vi.fn(),
			matches: query.includes("prefers-reduced-motion"),
			media: query,
			onchange: null,
			removeEventListener: vi.fn(),
			removeListener: vi.fn(),
		}));
		render(<HomeTerminal />);
		await act(async () => { await vi.runAllTimersAsync(); });

		const input = screen.getByRole("textbox", { name: "メッセージを入力" });
		expect(input).toBeEnabled();
		fireEvent.change(input, { target: { value: "<img src=x onerror=alert(1)>" } });
		fireEvent.submit(input.closest("form")!);
		await act(async () => { await vi.runAllTimersAsync(); });

		expect(document.querySelector(".terminal-working")).not.toBeInTheDocument();
		expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
		expect(screen.getByText("こんにちは。")).toBeInTheDocument();
		expect(document.querySelector(".terminal-transcript img")).toBeNull();
		expect(screen.getByRole("status")).toHaveTextContent("サイトの記事を案内します。");
		expect(screen.getByRole("link", { name: "[1] 記事" })).toHaveAttribute("href", "https://monipy.org/blog/2026/post");
		await act(async () => { await vi.runAllTimersAsync(); });
		expect(input).toHaveFocus();
	});

	it("plays the prepared sequence before enabling ordinary-motion input", async () => {
		render(<HomeTerminal />);
		const input = screen.getByRole("textbox", { name: "メッセージを入力" });
		expect(input).toBeDisabled();
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });
		expect(input).not.toHaveAttribute("placeholder");
		const launchCommand = document.querySelector(".terminal-launch code");
		expect(launchCommand).toHaveTextContent("");
		expect(document.querySelector(".terminal-launch .terminal-cursor")).toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(999); });
		expect(launchCommand).toHaveTextContent("");
		expect(input).toHaveValue("");

		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(launchCommand).toHaveTextContent("");
		await act(async () => { await vi.advanceTimersByTimeAsync(79); });
		expect(launchCommand).toHaveTextContent("");
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(launchCommand).toHaveTextContent("m");

		await act(async () => { await vi.advanceTimersByTimeAsync(420); });
		expect(launchCommand).toHaveTextContent("moni");
		expect(input).toHaveValue("");
		expect(screen.getByText("about — moni", { selector: ".window-title-text" })).toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(419); });
		expect(input).toHaveValue("");
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(input).toHaveValue("");
		await act(async () => { await vi.advanceTimersByTimeAsync(41); });
		expect(input).toHaveValue("");
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(input).toHaveValue("こ");

		await act(async () => { await vi.advanceTimersByTimeAsync(210); });
		expect(input).toHaveValue("こんにちは。");
		const animatedTranscript = document.querySelector(".animated-transcript .terminal-transcript");
		expect(animatedTranscript).not.toHaveTextContent("こんにちは。");

		await act(async () => { await vi.advanceTimersByTimeAsync(499); });
		expect(input).toHaveValue("こんにちは。");
		expect(animatedTranscript).not.toHaveTextContent("こんにちは。");
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(input).toHaveValue("");
		expect(animatedTranscript).toHaveTextContent("こんにちは。");
		expect(animatedTranscript?.querySelector(".terminal-output")).toBeNull();
		expect(document.querySelector(".terminal-working")).not.toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(299); });
		expect(document.querySelector(".terminal-working")).not.toBeInTheDocument();
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(document.querySelector(".terminal-measure")).toBeNull();
		expect(document.querySelector(".terminal-working")).toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(600); });
		expect(document.querySelector(".terminal-working")).not.toBeInTheDocument();
		const firstAnswer = animatedTranscript?.querySelector(".terminal-stream");
		expect(firstAnswer).toBeEmptyDOMElement();
		await act(async () => { await vi.advanceTimersByTimeAsync(21); });
		expect(firstAnswer).toBeEmptyDOMElement();
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(firstAnswer).not.toHaveTextContent("");

		await act(async () => { await vi.runAllTimersAsync(); });

		expect(input).toBeEnabled();
		expect(document.querySelector(".terminal-working")).not.toBeInTheDocument();
		expect(document.querySelector(".animated-transcript .terminal-transcript")).toHaveTextContent("空はなぜ青いの？");
		expect(screen.getByText("about — moni", { selector: ".window-title-text" })).toBeInTheDocument();
	});

	it("shows working feedback before streaming a free-input response", async () => {
		render(<HomeTerminal />);
		await act(async () => { await vi.runAllTimersAsync(); });

		const input = screen.getByRole("textbox", { name: "メッセージを入力" });
		fireEvent.change(input, { target: { value: "こんにちは" } });
		fireEvent.submit(input.closest("form")!);

		expect(input).toBeDisabled();
		const submittedTurn = screen.getByText("こんにちは").closest(".terminal-turn");
		expect(submittedTurn).not.toBeNull();
		expect(submittedTurn?.querySelector(".terminal-output")).toBeNull();
		expect(submittedTurn?.querySelector(".terminal-working")).not.toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(299); });
		expect(submittedTurn?.querySelector(".terminal-output")).toBeNull();
		expect(submittedTurn?.querySelector(".terminal-working")).not.toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(submittedTurn?.querySelector(".terminal-working")).toBeInTheDocument();
		expect(submittedTurn?.querySelector(".terminal-output-marker")).toHaveTextContent("●");
		expect(submittedTurn?.querySelector(".terminal-output-marker .animate-spin")).not.toBeInTheDocument();
		expect(submittedTurn?.querySelector('[role="status"]')).toHaveTextContent("Processing");
		expect(submittedTurn?.querySelector(".terminal-processing-dots")).toHaveTextContent("...");

		await act(async () => { await vi.advanceTimersByTimeAsync(599); });
		expect(submittedTurn?.querySelector(".terminal-working")).toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(submittedTurn?.querySelector(".terminal-working")).not.toBeInTheDocument();
		expect(submittedTurn?.querySelector(".terminal-stream")).toHaveTextContent("サイトの記事を案内します。");
		expect(submittedTurn?.querySelector(".terminal-sources")).toHaveTextContent("[1] 記事");

		await act(async () => { await vi.runAllTimersAsync(); });
		expect(input).toBeEnabled();
		expect(screen.getByRole("status")).toHaveTextContent("サイトの記事を案内します。");
	});

	it("streams answer deltas before revealing citations at completion", async () => {
		vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
			addEventListener: vi.fn(), addListener: vi.fn(), dispatchEvent: vi.fn(), matches: query.includes("prefers-reduced-motion"), media: query, onchange: null, removeEventListener: vi.fn(), removeListener: vi.fn(),
		}));
		let streamController!: ReadableStreamDefaultController<Uint8Array>;
		const response = new Response(new ReadableStream<Uint8Array>({
			start(controller) {
				streamController = controller;
			},
		}), { headers: { "content-type": "text/event-stream" } });
		vi.mocked(fetch).mockResolvedValue(response);

		render(<HomeTerminal />);
		await act(async () => { await vi.runAllTimersAsync(); });
		const input = screen.getByRole("textbox", { name: "メッセージを入力" });
		fireEvent.change(input, { target: { value: "質問" } });
		fireEvent.submit(input.closest("form")!);
		const submittedTurn = screen.getByText("質問").closest(".terminal-turn");
		expect(submittedTurn?.querySelector(".terminal-output-marker")).toHaveTextContent("●");
		expect(submittedTurn?.querySelector('[role="status"]')).toHaveTextContent("Processing");
		expect(submittedTurn?.querySelector(".terminal-processing-dots")).toHaveTextContent("...");

		await act(async () => {
			streamController.enqueue(encoder.encode('event: sources\ndata: {"sources":[{"locale":"en","title":"Article","url":"https://monipy.org/en/blog/2026/post"}]}\n\n'));
			streamController.enqueue(encoder.encode('event: delta\ndata: {"text":"途中"}\n\n'));
			await Promise.resolve();
		});
		expect(submittedTurn?.querySelector(".terminal-stream")).toHaveTextContent("途中");
		expect(screen.queryByRole("link", { name: "[1] Article（英語）" })).not.toBeInTheDocument();

		await act(async () => {
			streamController.enqueue(encoder.encode('event: delta\ndata: {"text":"回答"}\n\n'));
			streamController.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
			streamController.close();
			await Promise.resolve();
		});
		expect(submittedTurn?.querySelector(".terminal-stream")).toHaveTextContent("途中回答");
		const citation = screen.getByRole("link", { name: "[1] Article（英語）" });
		expect(citation).toHaveAttribute("href", "https://monipy.org/en/blog/2026/post");
		expect(citation).toHaveAttribute("rel", "noopener noreferrer");
		expect(citation).toHaveAttribute("target", "_blank");
	});

	it("sends only the latest three completed free-form exchanges", async () => {
		vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
			addEventListener: vi.fn(), addListener: vi.fn(), dispatchEvent: vi.fn(), matches: query.includes("prefers-reduced-motion"), media: query, onchange: null, removeEventListener: vi.fn(), removeListener: vi.fn(),
		}));
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockImplementation(async () => chatResponse(`回答${fetchMock.mock.calls.length}`));
		render(<HomeTerminal />);
		await act(async () => { await vi.runAllTimersAsync(); });

		const input = screen.getByRole("textbox", { name: "メッセージを入力" });
		for (const question of ["質問1", "質問2", "質問3", "質問4", "質問5"]) {
			fireEvent.change(input, { target: { value: question } });
			fireEvent.submit(input.closest("form")!);
			await act(async () => { await vi.runAllTimersAsync(); });
		}

		const body = JSON.parse(fetchMock.mock.calls[4][1]?.body as string) as { messages: Array<{ content: string }> };
		expect(body.messages).toHaveLength(7);
		expect(body.messages[0].content).toBe("質問2");
		expect(body.messages.at(-1)?.content).toBe("質問5");
	});

	it("renders a localized bounded error and re-enables input", async () => {
		vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
			addEventListener: vi.fn(), addListener: vi.fn(), dispatchEvent: vi.fn(), matches: query.includes("prefers-reduced-motion"), media: query, onchange: null, removeEventListener: vi.fn(), removeListener: vi.fn(),
		}));
		vi.mocked(fetch).mockResolvedValue(Response.json({ error: "rate_limited", success: false }, { status: 429 }));
		render(<HomeTerminal />);
		await act(async () => { await vi.runAllTimersAsync(); });
		const input = screen.getByRole("textbox", { name: "メッセージを入力" });
		fireEvent.change(input, { target: { value: "質問" } });
		fireEvent.submit(input.closest("form")!);
		await act(async () => { await vi.runAllTimersAsync(); });

		expect(screen.getByRole("status")).toHaveTextContent("質問が集中しています。少し待ってからもう一度お試しください。");
		expect(input).toBeEnabled();
		await act(async () => { await vi.runAllTimersAsync(); });
		expect(input).toHaveFocus();
	});

	it("logs development diagnostics without rendering them to visitors", async () => {
		vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
			addEventListener: vi.fn(), addListener: vi.fn(), dispatchEvent: vi.fn(), matches: query.includes("prefers-reduced-motion"), media: query, onchange: null, removeEventListener: vi.fn(), removeListener: vi.fn(),
		}));
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
		vi.mocked(fetch).mockResolvedValue(Response.json({
			detail: { message: "remote binding rejected the request", name: "Error" },
			error: "unavailable",
			stage: "provider_startup",
			success: false,
		}, { status: 503 }));

		render(<HomeTerminal locale="en" />);
		await act(async () => { await vi.runAllTimersAsync(); });
		const input = screen.getByRole("textbox", { name: "Enter a message" });
		fireEvent.change(input, { target: { value: "Help" } });
		fireEvent.submit(input.closest("form")!);
		await act(async () => { await vi.runAllTimersAsync(); });

		expect(screen.getByRole("status")).toHaveTextContent("The site guide is currently unavailable.");
		expect(screen.queryByText(/remote binding rejected/)).not.toBeInTheDocument();
		expect(consoleError).toHaveBeenCalledWith("Chat request failed", {
			code: "unavailable",
			detail: { message: "remote binding rejected the request", name: "Error" },
			stage: "provider_startup",
		});
		consoleError.mockRestore();
	});
});
