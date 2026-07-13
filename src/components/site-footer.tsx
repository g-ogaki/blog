import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="site-footer-inner">
				<p><span className="site-logo-mark" aria-hidden="true">m.</span> 学びと生活の、小さな記録。</p>
				<nav aria-label="フッターナビゲーション">
					<Link href="/">ホーム</Link>
					<Link href="/blog">ブログ</Link>
				</nav>
				<small>© {new Date().getFullYear()} moni</small>
			</div>
		</footer>
	);
}
