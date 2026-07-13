const japaneseDateFormatter = new Intl.DateTimeFormat("ja-JP", {
	day: "numeric",
	month: "long",
	timeZone: "Asia/Tokyo",
	year: "numeric",
});

export function formatPostDate(date: string) {
	return japaneseDateFormatter.format(new Date(`${date}T00:00:00+09:00`));
}
