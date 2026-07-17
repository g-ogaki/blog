import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="shell site-footer-inner">
				<nav aria-label="フッターナビゲーション">
					<ul>
						<li><a href="https://x.com/onakasuita_py">X (Twitter)</a></li>
						<li><a href="https://github.com/g-ogaki">GitHub</a></li>
						<li><Link href="/rss.xml">Feed</Link></li>
					</ul>
				</nav>
				<p className="footer-legal">© {new Date().getFullYear()} moni · Licensed under <a href="https://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0 1.0 Universal</a></p>
			</div>
		</footer>
	);
}
