import { SearchArchive } from "@/components/search-archive";
import { loadPosts } from "@/lib/content/posts";
import { buildTaxonomy } from "@/lib/content/taxonomy";
import { getDictionary, type Locale } from "@/lib/i18n";

export function BlogPage({ locale }: { locale: Locale }) {
	const copy = getDictionary(locale).archive;
	const posts = loadPosts({ includeDrafts: false, locale });
	const taxonomy = buildTaxonomy(posts);
	const archivePosts = posts.map((post) => ({
		imageUrl: post.metadata.image ? `/post-assets/${post.slug}/${post.metadata.image}` : undefined,
		url: post.url,
		metadata: {
			category: post.metadata.category,
			date: post.metadata.date,
			tags: post.metadata.tags,
			title: post.metadata.title,
		},
	}));
	return (
		<main className="archive-main mx-auto w-full max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-24" id="main-content">
			<header className="page-header max-w-3xl">
				<h1 className="text-3xl leading-9 font-semibold tracking-tight sm:text-4xl sm:leading-10">{copy.title}</h1>
				<p className="page-description mt-6 text-lg leading-8 text-text-muted">{copy.description}</p>
			</header>
			<SearchArchive locale={locale} posts={archivePosts} taxonomy={taxonomy} />
		</main>
	);
}
