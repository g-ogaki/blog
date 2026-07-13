import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeSwitcher } from "./theme-switcher";

beforeEach(() => {
	localStorage.clear();
	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		value: vi.fn().mockReturnValue({ matches: false }),
	});
});

afterEach(cleanup);

describe("ThemeSwitcher", () => {
	it("defaults to system and persists an explicit theme", () => {
		render(<ThemeSwitcher />);

		expect(screen.getByRole("radio", { name: "システム設定" })).toBeChecked();
		fireEvent.click(screen.getByRole("radio", { name: "ダーク" }));

		expect(document.documentElement).toHaveAttribute("data-theme", "dark");
		expect(localStorage.getItem("theme")).toBe("dark");

		fireEvent.click(screen.getByRole("radio", { name: "システム設定" }));

		expect(document.documentElement).not.toHaveAttribute("data-theme");
		expect(localStorage.getItem("theme")).toBe("system");
	});
});
