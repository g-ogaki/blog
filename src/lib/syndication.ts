import type { Post } from "@/lib/content/posts";
import { absoluteUrl, SITE_DESCRIPTION, SITE_ORIGIN, SITE_TITLE } from "@/lib/site";

interface SitemapEntry {
	lastModified?: Date;
	url: string;
}

function publishedPosts(posts: readonly Post[]) {
	return posts.filter((post) => !post.metadata.draft);
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

export function buildRssFeed(posts: readonly Post[]) {
	const visiblePosts = publishedPosts(posts);
	const items = visiblePosts.map((post) => {
		const url = absoluteUrl(post.url);
		return `    <item>
      <title>${xmlEscape(post.metadata.title)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <pubDate>${jstDate(post.metadata.date).toUTCString()}</pubDate>
      <description>${xmlEscape(post.metadata.summary)}</description>
    </item>`;
	});
	const lastBuildDate = visiblePosts[0]
		? `\n    <lastBuildDate>${jstDate(visiblePosts[0].metadata.date).toUTCString()}</lastBuildDate>`
		: "";

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_TITLE)}</title>
    <link>${SITE_ORIGIN}</link>
    <description>${xmlEscape(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <atom:link href="${SITE_ORIGIN}/rss.xml" rel="self" type="application/rss+xml" />${lastBuildDate}
${items.join("\n")}
  </channel>
</rss>
`;
}

export function buildSitemap(posts: readonly Post[]): SitemapEntry[] {
	const visiblePosts = publishedPosts(posts);
	const latestDate = visiblePosts[0]?.metadata.date;
	const sharedEntries: SitemapEntry[] = [
		{ url: SITE_ORIGIN, ...(latestDate ? { lastModified: jstDate(latestDate) } : {}) },
		{ url: absoluteUrl("/blog"), ...(latestDate ? { lastModified: jstDate(latestDate) } : {}) },
	];

	return [
		...sharedEntries,
		...visiblePosts.map((post) => ({
			url: absoluteUrl(post.url),
			lastModified: jstDate(post.metadata.date),
		})),
	];
}

export function buildSitemapXml(posts: readonly Post[]) {
	const entries = buildSitemap(posts).map((entry) => `<url>
  <loc>${xmlEscape(entry.url)}</loc>${entry.lastModified ? `\n  <lastmod>${entry.lastModified.toISOString()}</lastmod>` : ""}
</url>`);

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
