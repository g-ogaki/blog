import Image from "next/image";
import Link from "next/link";
import { HomeTerminal } from "@/components/home-terminal";
import { loadPosts, type Post } from "@/lib/content/posts";
import { formatPostDate } from "@/lib/format-date";
import { latestPosts } from "@/lib/content/taxonomy";

function XIcon() {
	return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M4 4l16 16M20 4 4 20" /></svg>;
}

function GitHubIcon() {
	return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M12 2.7a9.3 9.3 0 0 0-2.94 18.12c.47.08.64-.2.64-.45v-1.8c-2.62.57-3.17-1.11-3.17-1.11-.43-1.09-1.04-1.38-1.04-1.38-.85-.58.06-.57.06-.57.94.07 1.44.97 1.44.97.84 1.43 2.19 1.02 2.73.78.08-.61.33-1.02.6-1.25-2.09-.24-4.29-1.05-4.29-4.65 0-1.03.37-1.87.97-2.53-.1-.24-.42-1.2.09-2.5 0 0 .79-.25 2.56.97A8.9 8.9 0 0 1 12 6.98c.79 0 1.57.11 2.33.31 1.77-1.22 2.55-.97 2.55-.97.51 1.3.19 2.26.09 2.5.6.66.97 1.5.97 2.53 0 3.61-2.2 4.4-4.3 4.64.34.29.64.87.64 1.76v2.62c0 .25.17.54.65.45A9.3 9.3 0 0 0 12 2.7Z" /></svg>;
}

function PlaceholderImage() {
	return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><rect height="16" rx="2" width="18" x="3" y="4" /><circle cx="9" cy="9" r="1.5" /><path d="m5 18 4.5-4.5 3 3 2-2L19 18" /></svg>;
}

function PostMedia({ post, priority = false }: { post: Post; priority?: boolean }) {
	return (
		<div className={`post-media${post.metadata.image ? "" : " post-media--empty"}`}>
			{post.metadata.image ? <Image alt="" fill priority={priority} sizes="(max-width: 48rem) 100vw, 40vw" src={`/post-assets/${post.slug}/${post.metadata.image}`} unoptimized /> : <PlaceholderImage />}
		</div>
	);
}

export default function Home() {
	const posts = latestPosts(loadPosts({ includeDrafts: false }));
	const [featured, ...supporting] = posts;
	return (
		<main className="shell home-main" id="main-content">
			<section aria-labelledby="profile-heading">
				<div className="about-layout">
					<div className="profile-panel">
						<Image alt="moni" className="profile-portrait" height={276} priority src="/selfie.jpg" unoptimized width={277} />
						<h1 id="profile-heading">moni</h1>
						<p className="profile-purpose">勉強したことの備忘録や日常の出来事を記録しています。</p>
						<ul aria-label="ソーシャルリンク" className="profile-socials">
							<li><a aria-label="X (Twitter)" href="https://x.com/onakasuita_py"><XIcon /></a></li>
							<li><a aria-label="GitHub" href="https://github.com/g-ogaki"><GitHubIcon /></a></li>
						</ul>
					</div>
					<HomeTerminal />
				</div>
			</section>

			<section className="recent-section" aria-labelledby="recent-heading">
				<header className="section-heading"><h2 id="recent-heading">最近の記事</h2><Link href="/blog">すべての記事を見る</Link></header>
				{featured ? (
					<div className="recent-grid">
						<article className="featured-post">
							<Link aria-label={featured.metadata.title} href={featured.url}>
								<PostMedia post={featured} priority />
								<p className="post-meta"><time dateTime={featured.metadata.date}>{formatPostDate(featured.metadata.date)}</time><span>{featured.metadata.category}</span></p>
								<h3>{featured.metadata.title}</h3>
							</Link>
						</article>
						<ol className="recent-list" start={2}>
							{supporting.map((post) => (
								<li key={post.url}><article className="recent-post"><Link aria-label={post.metadata.title} href={post.url}><PostMedia post={post} /><div><h3>{post.metadata.title}</h3><p className="post-meta"><time dateTime={post.metadata.date}>{formatPostDate(post.metadata.date)}</time><span>{post.metadata.category}</span></p></div></Link></article></li>
							))}
						</ol>
					</div>
				) : <p>公開されている記事はまだありません。</p>}
			</section>
		</main>
	);
}
