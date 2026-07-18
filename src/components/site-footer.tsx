import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="site-footer mt-auto border-t border-site-border">
			<div className="site-footer-inner mx-auto flex min-h-28 w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
				<nav aria-label="フッターナビゲーション">
					<ul className="flex list-none flex-wrap justify-center gap-x-4 gap-y-2 p-0">
						<li><a className="inline-flex rounded-sm p-1 no-underline hover:bg-hover-surface motion-safe:transition-colors motion-safe:duration-150" href="https://x.com/onakasuita_py" rel="noopener noreferrer" target="_blank">X (Twitter)</a></li>
						<li><a className="inline-flex rounded-sm p-1 no-underline hover:bg-hover-surface motion-safe:transition-colors motion-safe:duration-150" href="https://github.com/g-ogaki" rel="noopener noreferrer" target="_blank">GitHub</a></li>
						<li><Link className="inline-flex rounded-sm p-1 no-underline hover:bg-hover-surface motion-safe:transition-colors motion-safe:duration-150" href="/rss.xml">Feed</Link></li>
					</ul>
				</nav>
				<p className="footer-legal m-0 text-sm text-text-muted">© {new Date().getFullYear()} moni · Licensed under <a className="text-inherit" href="https://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0 1.0 Universal</a></p>
			</div>
		</footer>
	);
}
