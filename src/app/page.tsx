import Image from "next/image";
import Link from "next/link";
import { PostList } from "@/components/post-list";
import { loadPosts } from "@/lib/content/posts";
import { latestPosts } from "@/lib/content/taxonomy";

export default function Home() {
	const posts = latestPosts(loadPosts({ includeDrafts: false }));
	return (
		<main id="main-content">
			<section className="home-hero">
				<div className="hero-copy">
					<p className="eyebrow">moni / personal journal</p>
					<h1><span>学びの途中を、</span><em>記録する。</em></h1>
					<p className="hero-description">技術、数学、投資、そして日々の暮らし。考えたことや試したことを、未来の自分へ残すための個人サイトです。</p>
					<div className="hero-actions">
						<Link className="primary-link" href="/blog">記事を読む <span aria-hidden="true">↗</span></Link>
						<a className="text-link" href="#about">moniについて <span aria-hidden="true">↓</span></a>
					</div>
				</div>
				<figure className="hero-portrait">
					<div className="hero-image-frame">
						<Image
							alt="moniのポートレート"
							fill
							priority
							sizes="(max-width: 832px) calc(100vw - 2rem), min(42vw, 38rem)"
							src="/top.jpg"
						/>
					</div>
					<figcaption><span>moni</span><span>Tokyo, Japan</span></figcaption>
				</figure>
				<p className="hero-side-note" aria-hidden="true">MONI&apos;S PAGE — EST. 2026</p>
			</section>

			<section className="home-section about-section" id="about" aria-labelledby="about-heading">
				<div className="section-marker" aria-hidden="true"><span>01</span><span>About</span></div>
				<div className="about-copy">
					<p className="eyebrow">About moni</p>
					<h2 id="about-heading">わからないことを、<br />ひとつずつ。</h2>
					<p>moniです。プログラミングを中心に、興味を持ったことを学んでいます。この場所では、完成した答えだけでなく、迷った過程も含めて記録します。</p>
				</div>
			</section>

			<section className="home-section latest-section" aria-labelledby="latest-heading">
				<div className="section-heading">
					<div className="section-title-group">
						<div className="section-marker" aria-hidden="true"><span>02</span><span>Journal</span></div>
						<div><p className="eyebrow">Latest notes</p><h2 id="latest-heading">最新の記事</h2></div>
					</div>
					<Link className="text-link" href="/blog">すべての記事を見る <span aria-hidden="true">→</span></Link>
				</div>
				<PostList posts={posts} />
			</section>
		</main>
	);
}
