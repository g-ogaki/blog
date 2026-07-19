import { describe, expect, it } from "vitest";
import { isSafeLanguageRedirect, localeFromAcceptLanguage, localeFromCookie, localePreferenceCookie, preferredLocale } from "./locale-routing";

describe("locale routing", () => {
	it("prefers an explicit saved locale over browser language", () => {
		expect(localeFromCookie("theme=dark; site_locale=ja")).toBe("ja");
		expect(preferredLocale("site_locale=ja", "en-US,en;q=0.9")).toBe("ja");
	});

	it("selects the highest quality supported browser language and defaults to Japanese", () => {
		expect(localeFromAcceptLanguage("fr, en-US;q=0.8, ja;q=0.9")).toBe("ja");
		expect(localeFromAcceptLanguage("fr-FR,de;q=0.8")).toBe("ja");
		expect(localeFromAcceptLanguage("en;q=0")).toBe("ja");
	});

	it("builds a constrained persistent cookie and accepts either localized public route", () => {
		expect(localePreferenceCookie("en")).toContain("site_locale=en");
		expect(localePreferenceCookie("en")).toContain("SameSite=Lax");
		expect(isSafeLanguageRedirect("/en/blog/2026/post")).toBe(true);
		expect(isSafeLanguageRedirect("/blog/2026/post")).toBe(true);
		expect(isSafeLanguageRedirect("//evil.example")).toBe(false);
	});
});
