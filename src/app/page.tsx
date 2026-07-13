import Link from "next/link";
import { PostList } from "@/components/post-list";
import { loadPosts } from "@/lib/content/posts";
import { latestPosts } from "@/lib/content/taxonomy";

export default function Home() {
	const posts = latestPosts(loadPosts({ includeDrafts: false }));
	return (
		<main id="main-content">
			<section className="home-hero">
				<div className="hero-orbit" aria-hidden="true"><span>記</span><span>録</span></div>
				<div className="hero-copy">
					<p className="eyebrow">Personal notes / Tokyo</p>
					<h1>学びの途中を、<br /><em>記録する。</em></h1>
					<p className="hero-description">技術、数学、投資、そして日々の暮らし。考えたことや試したことを、未来の自分へ残すための個人サイトです。</p>
					<Link className="text-link" href="/blog">記事を読む <span aria-hidden="true">→</span></Link>
				</div>
				<p className="hero-side-note" aria-hidden="true">MONI PAGE · SINCE 2026</p>
			</section>

			<section className="home-section latest-section" aria-labelledby="latest-heading">
				<div className="section-heading">
					<div><p className="eyebrow">Latest notes</p><h2 id="latest-heading">最新の記事</h2></div>
					<Link className="text-link" href="/blog">すべての記事を見る <span aria-hidden="true">→</span></Link>
				</div>
				<PostList posts={posts} />
			</section>

			<section className="home-section about-section" aria-labelledby="about-heading">
				<p className="about-number" aria-hidden="true">私<br />について</p>
				<div className="about-copy">
					<p className="eyebrow">About moni</p>
					<h2 id="about-heading">わからないことを、<br />ひとつずつ。</h2>
					<p>moniです。プログラミングを中心に、興味を持ったことを学んでいます。この場所では、完成した答えだけでなく、迷った過程も含めて記録します。</p>
				</div>
			</section>
		</main>
	);
}
