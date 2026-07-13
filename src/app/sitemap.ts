import type { MetadataRoute } from "next";
import { loadPosts } from "@/lib/content/posts";
import { buildSitemap } from "@/lib/syndication";

export default function sitemap(): MetadataRoute.Sitemap {
	return buildSitemap(loadPosts({ includeDrafts: false }));
}
