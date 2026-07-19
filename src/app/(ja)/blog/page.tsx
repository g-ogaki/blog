import type { Metadata } from "next";
import { BlogPage } from "@/components/blog-page";

export const metadata: Metadata = {
	title: "ブログ",
	description: "技術、数学、日々の学びを記録するブログです。",
	alternates: { canonical: "/blog", languages: { ja: "/blog", en: "/en/blog", "x-default": "/blog" } },
};

export default function JapaneseBlogPage() {
	return <BlogPage locale="ja" />;
}
