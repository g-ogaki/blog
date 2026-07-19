import type { Metadata } from "next";
import { BlogPage } from "@/components/blog-page";

export const metadata: Metadata = {
	title: "Blog",
	description: "A blog about technology, mathematics, and everyday learning.",
	alternates: { canonical: "/en/blog", languages: { ja: "/blog", en: "/en/blog", "x-default": "/blog" } },
};

export default function EnglishBlogPage() {
	return <BlogPage locale="en" />;
}
