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

		expect(screen.getByText("自己紹介してください。")).toBeInTheDocument();
		expect(screen.getByText(/気になったことを小さく試し/)).toBeInTheDocument();
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

		expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
		expect(screen.getByText("自己紹介してください。")).toBeInTheDocument();
		expect(document.querySelector(".terminal-transcript img")).toBeNull();
		expect(screen.getByRole("status")).toHaveTextContent("自由記述に対する返答はできない");
	});

	it("plays the prepared sequence before enabling ordinary-motion input", async () => {
		render(<HomeTerminal />);
		const input = screen.getByRole("textbox", { name: "メッセージを入力" });
		expect(input).toBeDisabled();

		await act(async () => { await vi.runAllTimersAsync(); });

		expect(input).toBeEnabled();
		expect(document.querySelector("[aria-hidden='true'] .terminal-transcript")).toHaveTextContent("普段はどのように学んでいますか？");
		expect(screen.getByText("about — moni", { selector: ".window-title" })).toBeInTheDocument();
	});
});
