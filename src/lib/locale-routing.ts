import { isLocale, type Locale } from "./i18n";

export const localeCookieName = "site_locale";
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function localeFromCookie(cookieHeader: string | null): Locale | undefined {
	if (!cookieHeader) return undefined;
	for (const item of cookieHeader.split(";")) {
		const [name, value] = item.trim().split("=", 2);
		if (name === localeCookieName && isLocale(value)) return value;
	}
	return undefined;
}

export function localeFromAcceptLanguage(header: string | null): Locale {
	if (!header) return "ja";
	const preferences = header
		.split(",")
		.map((item, index) => {
			const [tag, ...parameters] = item.trim().toLowerCase().split(";");
			const quality = Number(parameters.find((value) => value.trim().startsWith("q="))?.split("=")[1] ?? "1");
			return { index, locale: tag.split("-")[0], quality: Number.isFinite(quality) ? quality : 0 };
		})
		.filter((item) => item.quality > 0 && (item.locale === "ja" || item.locale === "en"))
		.sort((left, right) => right.quality - left.quality || left.index - right.index);
	return (preferences[0]?.locale as Locale | undefined) ?? "ja";
}

export function preferredLocale(cookieHeader: string | null, acceptLanguage: string | null) {
	return localeFromCookie(cookieHeader) ?? localeFromAcceptLanguage(acceptLanguage);
}

export function localePreferenceCookie(locale: Locale) {
	return `${localeCookieName}=${locale}; Max-Age=${localeCookieMaxAge}; Path=/; Secure; SameSite=Lax`;
}

export function isSafeLanguageRedirect(pathname: string) {
	if (!pathname.startsWith("/") || pathname.startsWith("//") || pathname.includes("\\")) return false;
	const japanesePath = pathname === "/" || pathname === "/blog" || pathname.startsWith("/blog/");
	const englishPath = pathname === "/en" || pathname === "/en/blog" || pathname.startsWith("/en/blog/");
	return japanesePath || englishPath;
}
