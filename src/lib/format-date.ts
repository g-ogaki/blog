import type { Locale } from "./i18n";

const japaneseDateFormatter = new Intl.DateTimeFormat("ja-JP", {
	day: "2-digit",
	month: "2-digit",
	timeZone: "Asia/Tokyo",
	year: "numeric",
});

const englishDateFormatter = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "long",
	timeZone: "Asia/Tokyo",
	year: "numeric",
});

export function formatSiteDate(value: string, locale: Locale = "ja") {
	const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+09:00`) : new Date(value);
	if (locale === "en") return englishDateFormatter.format(date);
	const parts = Object.fromEntries(japaneseDateFormatter.formatToParts(date).map((part) => [part.type, part.value]));
	return `${parts.year}.${parts.month}.${parts.day}`;
}

export function formatPostDate(date: string, locale: Locale = "ja") {
	return formatSiteDate(date, locale);
}
