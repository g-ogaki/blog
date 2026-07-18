const japaneseDateFormatter = new Intl.DateTimeFormat("ja-JP", {
	day: "2-digit",
	month: "2-digit",
	timeZone: "Asia/Tokyo",
	year: "numeric",
});

export function formatSiteDate(value: string) {
	const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00+09:00`) : new Date(value);
	const parts = Object.fromEntries(japaneseDateFormatter.formatToParts(date).map((part) => [part.type, part.value]));
	return `${parts.year}.${parts.month}.${parts.day}`;
}

export function formatPostDate(date: string) {
	return formatSiteDate(date);
}
