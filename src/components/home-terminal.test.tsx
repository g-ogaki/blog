import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeTerminal } from "./home-terminal";

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
});

afterEach(() => {
	cleanup();
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

		expect(screen.queryByText("Working…")).not.toBeInTheDocument();
		expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
		expect(screen.getByText("こんにちは。")).toBeInTheDocument();
		expect(document.querySelector(".terminal-transcript img")).toBeNull();
		expect(screen.getByRole("status")).toHaveTextContent("自由回答機能を実装したいのですが");
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
		expect(screen.queryByText("Working…")).not.toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(299); });
		expect(screen.queryByText("Working…")).not.toBeInTheDocument();
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(document.querySelector(".terminal-measure")).toBeNull();
		expect(screen.getByText("Working…")).toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(600); });
		expect(screen.queryByText("Working…")).not.toBeInTheDocument();
		await act(async () => { await vi.advanceTimersByTimeAsync(528); });
		expect(animatedTranscript).toHaveTextContent("こんにちは！何かお手伝いできることはありますか？");
		expect(input).toHaveValue("");

		await act(async () => { await vi.advanceTimersByTimeAsync(629); });
		expect(input).toHaveValue("");
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(input).toHaveValue("");
		await act(async () => { await vi.advanceTimersByTimeAsync(41); });
		expect(input).toHaveValue("");
		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(input).toHaveValue("あ");

		await act(async () => { await vi.runAllTimersAsync(); });

		expect(input).toBeEnabled();
		expect(screen.queryByText("Working…")).not.toBeInTheDocument();
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
		expect(screen.queryByText("Working…")).not.toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(299); });
		expect(submittedTurn?.querySelector(".terminal-output")).toBeNull();
		expect(screen.queryByText("Working…")).not.toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(screen.getByText("Working…")).toBeInTheDocument();
		expect(submittedTurn?.querySelector(".terminal-output-marker .animate-spin")).toHaveTextContent("◒");

		await act(async () => { await vi.advanceTimersByTimeAsync(599); });
		expect(screen.getByText("Working…")).toBeInTheDocument();

		await act(async () => { await vi.advanceTimersByTimeAsync(1); });
		expect(screen.queryByText("Working…")).not.toBeInTheDocument();
		expect(input).toBeDisabled();
		await act(async () => { await vi.advanceTimersByTimeAsync(880); });
		expect(submittedTurn?.querySelector(".terminal-stream")).toHaveTextContent("自由回答機能を実装したい");
		expect(submittedTurn?.querySelector(".terminal-stream")).not.toHaveTextContent("助けて");

		await act(async () => { await vi.runAllTimersAsync(); });
		expect(input).toBeEnabled();
		expect(screen.getByRole("status")).toHaveTextContent("自由回答機能を実装したいのですが");
	});
});
