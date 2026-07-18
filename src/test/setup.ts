import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

const storage = new Map<string, string>();

Object.defineProperty(window, "localStorage", {
	configurable: true,
	value: {
		clear: () => storage.clear(),
		getItem: (key: string) => storage.get(key) ?? null,
		removeItem: (key: string) => storage.delete(key),
		setItem: (key: string, value: string) => storage.set(key, String(value)),
	},
});

Object.defineProperty(window, "matchMedia", {
	configurable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		addEventListener: vi.fn(),
		addListener: vi.fn(),
		dispatchEvent: vi.fn(),
		matches: false,
		media: query,
		onchange: null,
		removeEventListener: vi.fn(),
		removeListener: vi.fn(),
	})),
});
