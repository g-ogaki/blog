export const locales = ["ja", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: unknown): value is Locale {
	return typeof value === "string" && locales.includes(value as Locale);
}

export function localePrefix(locale: Locale) {
	return locale === "en" ? "/en" : "";
}

export function homePath(locale: Locale) {
	return locale === "en" ? "/en" : "/";
}

export function blogPath(locale: Locale) {
	return `${localePrefix(locale)}/blog`;
}

export function postPath(locale: Locale, slug: string) {
	return `${blogPath(locale)}/${slug}`;
}

export function feedPath(locale: Locale) {
	return locale === "en" ? "/en/rss.xml" : "/rss.xml";
}

export function otherLocale(locale: Locale): Locale {
	return locale === "ja" ? "en" : "ja";
}

export const dictionaries = {
	ja: {
		siteDescription: "moniが技術や日々の学びを記録する個人サイトです。",
		skipLink: "本文へ移動",
		navigation: { label: "メインナビゲーション", home: "ホーム", blog: "ブログ", more: "その他の操作" },
		language: {
			change: "表示言語を変更",
			menu: "表示言語",
			japanese: "日本語",
			english: "English",
			selected: "選択中",
		},
		theme: {
			change: "表示テーマを変更",
			menu: "表示テーマ",
			light: "ライト",
			dark: "ダーク",
			system: "システム",
			selected: "選択中",
		},
		headerSearch: { label: "ブログを検索", placeholder: "検索" },
		footerNavigation: "フッターナビゲーション",
		home: {
			purpose: "数学と音楽だけしていたい",
			socials: "ソーシャルリンク",
			recent: "最近の記事",
			allPosts: "すべての記事を見る",
			empty: "公開されている記事はまだありません。",
		},
		archive: {
			title: "ブログ",
			description: "勉強したことの備忘録や日常の出来事",
			metadataDescription: "技術、数学、日々の学びを記録するブログです。",
			find: "記事を探す",
			search: "記事を検索",
			searchPlaceholder: "キーワードを入力",
			filter: "記事を絞り込む",
			classification: "記事の分類",
			category: "カテゴリー",
			tags: "タグ",
			year: "年",
			month: "月",
			list: "記事一覧",
			empty: "条件に一致する記事はありません。",
			loadMore: "さらに読み込む",
			visible: (visible: number, total: number) => `${total}件中${visible}件を表示`,
			noscript: "検索と絞り込みにはJavaScriptが必要です。すべての記事は一覧から読めます。",
			loading: "検索を準備しています。",
			unavailable: "検索を利用できません。すべての記事を表示しています。",
			searching: "検索しています。",
			found: (count: number) => `${count}件の記事が見つかりました。`,
			total: (count: number) => `全${count}件`,
			formatYear: (year: string) => `${year}年`,
			formatMonth: (year: string, month: number) => `${year}年${month}月`,
		},
		post: {
			breadcrumb: "パンくず",
			blog: "ブログ",
			closeImage: "拡大画像を閉じる",
			enlargeImage: "画像を拡大",
			tags: "タグ",
			toc: "目次",
		},
		comments: {
			heading: "コメント",
			count: (count: number) => `${count}件のコメント`,
			loading: "コメントを読み込んでいます。",
			loadError: "コメントを読み込めませんでした。",
			empty: "まだコメントはありません。",
			write: "コメントを書く",
			moderation: "投稿は確認後に公開されます。",
			name: "名前",
			comment: "コメント",
			verificationMissing: "コメント認証が設定されていません。",
			verificationError: "コメント認証を読み込めませんでした。再試行してください。",
			sending: "送信中…",
			send: "送信",
			success: "コメントを受け付けました。承認後に表示されます。",
			invalid: "入力内容を確認してください。",
			forbidden: "認証を確認できませんでした。もう一度お試しください。",
			rateLimited: "本日の投稿上限に達しました。時間をおいてお試しください。",
			failure: "コメントを送信できませんでした。時間をおいてお試しください。",
		},
		suggestion: {
			translated: "このページを日本語で読む",
			unavailable: "この記事は日本語で公開されていません。",
			close: "言語の案内を閉じる",
		},
	},
	en: {
		siteDescription: "A personal site where moni writes about technology and everyday learning.",
		translationNotice: {
			label: "Translation notice",
			beforeLink: "This English version was translated from the ",
			link: "original Japanese article",
			afterLink: " using AI and may contain inaccuracies.",
		},
		skipLink: "Skip to content",
		navigation: { label: "Main navigation", home: "Home", blog: "Blog", more: "More options" },
		language: {
			change: "Change display language",
			menu: "Display language",
			japanese: "日本語",
			english: "English",
			selected: "Selected",
		},
		theme: {
			change: "Change display theme",
			menu: "Display theme",
			light: "Light",
			dark: "Dark",
			system: "System",
			selected: "Selected",
		},
		headerSearch: { label: "Search the blog", placeholder: "Search" },
		footerNavigation: "Footer navigation",
		home: {
			purpose: "wanna spare time only for math and music",
			socials: "Social links",
			recent: "Recent posts",
			allPosts: "View all posts",
			empty: "There are no published posts yet.",
		},
		archive: {
			title: "Blog",
			description: "Notes on what I study and moments from everyday life",
			metadataDescription: "A blog about technology, mathematics, and everyday learning.",
			find: "Find posts",
			search: "Search posts",
			searchPlaceholder: "Enter keywords",
			filter: "Filter posts",
			classification: "Post classification",
			category: "Category",
			tags: "Tags",
			year: "Year",
			month: "Month",
			list: "Posts",
			empty: "No posts match these criteria.",
			loadMore: "Load more",
			visible: (visible: number, total: number) => `Showing ${visible} of ${total}`,
			noscript: "Search and filtering require JavaScript. Every post remains available in the list.",
			loading: "Preparing search.",
			unavailable: "Search is unavailable. Showing every post.",
			searching: "Searching.",
			found: (count: number) => `${count} ${count === 1 ? "post" : "posts"} found.`,
			total: (count: number) => `${count} ${count === 1 ? "post" : "posts"}`,
			formatYear: (year: string) => year,
			formatMonth: (year: string, month: number) => new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC", year: "numeric" }).format(new Date(Date.UTC(Number(year), month - 1, 1))),
		},
		post: {
			breadcrumb: "Breadcrumb",
			blog: "Blog",
			closeImage: "Close enlarged image",
			enlargeImage: "Enlarge image",
			tags: "Tags",
			toc: "Table of contents",
		},
		comments: {
			heading: "Comments",
			count: (count: number) => `${count} ${count === 1 ? "comment" : "comments"}`,
			loading: "Loading comments.",
			loadError: "Comments could not be loaded.",
			empty: "There are no comments yet.",
			write: "Write a comment",
			moderation: "Submissions appear after moderation.",
			name: "Name",
			comment: "Comment",
			verificationMissing: "Comment verification is not configured.",
			verificationError: "Comment verification could not be loaded. Please try again.",
			sending: "Sending…",
			send: "Send",
			success: "Your comment was received and will appear after approval.",
			invalid: "Please check your submission.",
			forbidden: "Verification failed. Please try again.",
			rateLimited: "You have reached today's submission limit. Please try again later.",
			failure: "Your comment could not be sent. Please try again later.",
		},
		suggestion: {
			translated: "Read this page in English",
			unavailable: "This article is not available in English.",
			close: "Dismiss language suggestion",
		},
	},
} as const;

export function getDictionary<const T extends Locale>(locale: T): (typeof dictionaries)[T] {
	return dictionaries[locale];
}
