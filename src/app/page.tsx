import Image from "next/image";
import Link from "next/link";
import { HomeTerminal } from "@/components/home-terminal";
import { loadPosts, type Post } from "@/lib/content/posts";
import { formatPostDate } from "@/lib/format-date";
import { latestPosts } from "@/lib/content/taxonomy";

function XIcon() {
	return <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>;
}

function GitHubIcon() {
	return <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943Z" /></svg>;
}

function PlaceholderImage() {
	return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><rect height="16" rx="2" width="18" x="3" y="4" /><circle cx="9" cy="9" r="1.5" /><path d="m5 18 4.5-4.5 3 3 2-2L19 18" /></svg>;
}

function PostMedia({ post, priority = false }: { post: Post; priority?: boolean }) {
	return (
		<div className={`post-media relative grid aspect-video w-full place-items-center overflow-hidden rounded-lg border border-site-border bg-surface-subtle text-text-muted [&_svg]:size-6 [&_svg]:stroke-current [&_svg]:stroke-1.5${post.metadata.image ? "" : " post-media--empty"}`}>
			{post.metadata.image ? <Image alt="" className="object-cover" fill priority={priority} sizes="(max-width: 48rem) 100vw, 40vw" src={`/post-assets/${post.slug}/${post.metadata.image}`} unoptimized /> : <PlaceholderImage />}
		</div>
	);
}

export default function Home() {
	const posts = latestPosts(loadPosts({ includeDrafts: false }));
	const [featured, ...supporting] = posts;
	return (
		<main className="home-main mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:px-6 sm:pt-16 sm:pb-24" id="main-content">
			<section aria-labelledby="profile-heading">
				<div className="about-layout grid grid-cols-1 items-stretch gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12">
					<div className="profile-panel flex flex-col items-center rounded-lg border border-site-border bg-surface-raised p-4 text-center sm:p-8">
						<Image alt="moni" className="profile-portrait size-48 flex-none rounded-full border border-site-border object-cover" height={276} priority src="/selfie.jpg" unoptimized width={277} />
						<h1 className="mt-8 text-3xl leading-9 font-semibold tracking-tight sm:text-3xl sm:leading-10" id="profile-heading">moni</h1>
						<p className="profile-purpose mt-8 w-full text-center text-text-muted">数学と音楽だけしていたい</p>
						<ul aria-label="ソーシャルリンク" className="profile-socials mt-0 flex list-none gap-3 p-0 pt-8 md:mt-auto">
							<li><a aria-label="X (Twitter)" className="grid size-11 place-items-center rounded-md border border-site-border bg-surface-subtle no-underline hover:bg-hover-surface [&_svg]:size-5 motion-safe:transition-colors motion-safe:duration-150" href="https://x.com/onakasuita_py" rel="noopener noreferrer" target="_blank"><XIcon /></a></li>
							<li><a aria-label="GitHub" className="grid size-11 place-items-center rounded-md border border-site-border bg-surface-subtle no-underline hover:bg-hover-surface [&_svg]:size-5 motion-safe:transition-colors motion-safe:duration-150" href="https://github.com/g-ogaki" rel="noopener noreferrer" target="_blank"><GitHubIcon /></a></li>
						</ul>
					</div>
					<HomeTerminal />
				</div>
			</section>

			<section className="recent-section mt-16" aria-labelledby="recent-heading">
				<header className="section-heading mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8"><h2 className="text-2xl leading-8 font-semibold tracking-tight" id="recent-heading">最近の記事</h2><Link className="rounded-sm p-2 text-sm font-medium no-underline hover:bg-hover-surface motion-safe:transition-colors motion-safe:duration-150" href="/blog">すべての記事を見る</Link></header>
				{featured ? (
					<div className="recent-grid grid grid-cols-1 items-start gap-12 md:grid-cols-2">
						<article className="featured-post">
							<Link aria-label={featured.metadata.title} className="group -m-4 block rounded-md p-4 text-inherit no-underline hover:bg-hover-surface motion-safe:transition-colors motion-safe:duration-150" href={featured.url}>
								<PostMedia post={featured} priority />
								<p className="post-meta mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs leading-4 text-text-muted"><time dateTime={featured.metadata.date}>{formatPostDate(featured.metadata.date)}</time><span>{featured.metadata.category}</span></p>
								<h3 className="mt-3 text-2xl leading-8 font-semibold group-hover:text-action-hover">{featured.metadata.title}</h3>
							</Link>
						</article>
						<ol className="recent-list grid list-none gap-6 p-0" start={2}>
							{supporting.map((post) => (
								<li key={post.url}><article className="recent-post"><Link aria-label={post.metadata.title} className="group -m-3 grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-4 rounded-md p-3 text-inherit no-underline hover:bg-hover-surface sm:grid-cols-[10rem_minmax(0,1fr)] motion-safe:transition-colors motion-safe:duration-150" href={post.url}><PostMedia post={post} /><div><h3 className="text-base leading-snug font-semibold group-hover:text-action-hover">{post.metadata.title}</h3><p className="post-meta mt-2 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs leading-4 text-text-muted"><time dateTime={post.metadata.date}>{formatPostDate(post.metadata.date)}</time><span>{post.metadata.category}</span></p></div></Link></article></li>
							))}
						</ol>
					</div>
				) : <p>公開されている記事はまだありません。</p>}
			</section>
		</main>
	);
}
