import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("language preference route", () => {
	it("stores the selected locale and redirects to an allowed localized path", async () => {
		const response = await GET(
			new Request("https://monipy.org/language/en?redirect=%2Fen%2Fblog%2F2026%2Fpost"),
			{ params: Promise.resolve({ locale: "en" }) },
		);

		expect(response.status).toBe(303);
		expect(response.headers.get("location")).toBe("https://monipy.org/en/blog/2026/post");
		expect(response.headers.get("set-cookie")).toContain("site_locale=en");
		expect(response.headers.get("set-cookie")).toContain("Max-Age=31536000");
	});

	it("falls back to the locale homepage for an unsafe redirect", async () => {
		const response = await GET(
			new Request("https://monipy.org/language/ja?redirect=https%3A%2F%2Fevil.example"),
			{ params: Promise.resolve({ locale: "ja" }) },
		);

		expect(response.status).toBe(303);
		expect(response.headers.get("location")).toBe("https://monipy.org/");
	});

	it("saves English preference while returning to a Japanese-only article", async () => {
		const response = await GET(
			new Request("https://monipy.org/language/en?redirect=%2Fblog%2F2026%2F20260702-math-as-prose"),
			{ params: Promise.resolve({ locale: "en" }) },
		);

		expect(response.status).toBe(303);
		expect(response.headers.get("location")).toBe("https://monipy.org/blog/2026/20260702-math-as-prose");
		expect(response.headers.get("set-cookie")).toContain("site_locale=en");
	});

	it("rejects unsupported locales", async () => {
		const response = await GET(
			new Request("https://monipy.org/language/fr"),
			{ params: Promise.resolve({ locale: "fr" }) },
		);

		expect(response.status).toBe(404);
	});
});
