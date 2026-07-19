import type { Post } from "@/lib/content/posts";
import { blogPath, feedPath, getDictionary, homePath, type Locale } from "@/lib/i18n";
import { absoluteUrl, SITE_ORIGIN, SITE_TITLE } from "@/lib/site";

interface SitemapAlternate {
	hreflang: Locale | "x-default";
	href: string;
}

interface SitemapEntry {
	alternates: SitemapAlternate[];
	lastModified?: Date;
	url: string;
}

function publishedPosts(posts: readonly Post[], locale?: Locale) {
	return posts.filter((post) => !post.metadata.draft && (!locale || post.locale === locale));
}

function xmlEscape(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function jstDate(date: string) {
	return new Date(`${date}T00:00:00+09:00`);
}

export function buildRssFeed(posts: readonly Post[], locale: Locale = "ja") {
	const visiblePosts = publishedPosts(posts, locale);
	const dictionary = getDictionary(locale);
	const items = visiblePosts.map((post) => {
		const url = absoluteUrl(post.url);
		return `    <item>
      <title>${xmlEscape(post.metadata.title)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <pubDate>${jstDate(post.metadata.date).toUTCString()}</pubDate>
      <description>${xmlEscape(post.description)}</description>
    </item>`;
	});
	const lastBuildDate = visiblePosts[0]
		? `\n    <lastBuildDate>${jstDate(visiblePosts[0].metadata.date).toUTCString()}</lastBuildDate>`
		: "";
	const feedUrl = absoluteUrl(feedPath(locale));

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_TITLE)}</title>
    <link>${absoluteUrl(homePath(locale))}</link>
    <description>${xmlEscape(dictionary.siteDescription)}</description>
    <language>${locale}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />${lastBuildDate}
${items.join("\n")}
  </channel>
</rss>
`;
}

function localizedAlternates(jaUrl: string | undefined, enUrl: string | undefined) {
	const alternates: SitemapAlternate[] = [];
	if (jaUrl) alternates.push({ hreflang: "ja", href: absoluteUrl(jaUrl) });
	if (enUrl) alternates.push({ hreflang: "en", href: absoluteUrl(enUrl) });
	const fallback = jaUrl ?? enUrl;
	if (fallback) alternates.push({ hreflang: "x-default", href: absoluteUrl(fallback) });
	return alternates;
}

export function buildSitemap(posts: readonly Post[]): SitemapEntry[] {
	const visiblePosts = publishedPosts(posts);
	const latestByLocale = {
		ja: visiblePosts.find((post) => post.locale === "ja")?.metadata.date,
		en: visiblePosts.find((post) => post.locale === "en")?.metadata.date,
	};
	const sharedAlternates = localizedAlternates(homePath("ja"), homePath("en"));
	const archiveAlternates = localizedAlternates(blogPath("ja"), blogPath("en"));
	const entries: SitemapEntry[] = [
		{ url: absoluteUrl(homePath("ja")), alternates: sharedAlternates, ...(latestByLocale.ja ? { lastModified: jstDate(latestByLocale.ja) } : {}) },
		{ url: absoluteUrl(homePath("en")), alternates: sharedAlternates, ...(latestByLocale.en ? { lastModified: jstDate(latestByLocale.en) } : {}) },
		{ url: absoluteUrl(blogPath("ja")), alternates: archiveAlternates, ...(latestByLocale.ja ? { lastModified: jstDate(latestByLocale.ja) } : {}) },
		{ url: absoluteUrl(blogPath("en")), alternates: archiveAlternates, ...(latestByLocale.en ? { lastModified: jstDate(latestByLocale.en) } : {}) },
	];
	const bySlug = new Map<string, Partial<Record<Locale, Post>>>();
	for (const post of visiblePosts) {
		const translations = bySlug.get(post.slug) ?? {};
		translations[post.locale] = post;
		bySlug.set(post.slug, translations);
	}
	for (const translations of bySlug.values()) {
		const alternates = localizedAlternates(translations.ja?.url, translations.en?.url);
		for (const locale of ["ja", "en"] as const) {
			const post = translations[locale];
			if (post) entries.push({ url: absoluteUrl(post.url), lastModified: jstDate(post.metadata.date), alternates });
		}
	}
	return entries;
}

export function buildSitemapXml(posts: readonly Post[]) {
	const entries = buildSitemap(posts).map((entry) => {
		const links = entry.alternates.map((alternate) =>
			`  <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${xmlEscape(alternate.href)}" />`,
		);
		return `<url>
  <loc>${xmlEscape(entry.url)}</loc>${entry.lastModified ? `\n  <lastmod>${entry.lastModified.toISOString()}</lastmod>` : ""}
${links.join("\n")}
</url>`;
	});

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;
}

export function buildRobotsText() {
	return `User-Agent: *
Allow: /

Host: ${SITE_ORIGIN}
Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
}
