import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
	return (
		<header className="site-header">
			<div className="site-header-inner">
				<Link className="site-logo" href="/" aria-label="moni's page">
					<span className="site-logo-mark" aria-hidden="true">m.</span>
					<span>moni&apos;s page</span>
				</Link>
				<div className="site-header-actions">
					<nav aria-label="メインナビゲーション">
						<Link href="/">ホーム</Link>
						<Link href="/blog">ブログ</Link>
					</nav>
					<ThemeSwitcher />
				</div>
			</div>
		</header>
	);
}
