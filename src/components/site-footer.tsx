import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="site-footer-inner">
				<div className="footer-intro">
					<p className="footer-logo"><span className="site-logo-mark" aria-hidden="true">m</span> moni&apos;s page</p>
					<p>学びと生活の、小さな記録。</p>
				</div>
				<div className="footer-links">
					<p className="eyebrow">Navigate</p>
					<nav aria-label="フッターナビゲーション">
						<Link href="/">ホーム</Link>
						<Link href="/blog">ブログ</Link>
					</nav>
				</div>
				<small>© {new Date().getFullYear()} moni<br />Made with curiosity in Tokyo.</small>
			</div>
		</footer>
	);
}
