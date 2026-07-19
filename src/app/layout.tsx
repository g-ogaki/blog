import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_DESCRIPTION, SITE_ORIGIN, SITE_TITLE } from "@/lib/site";
import "./globals.css";

const themeScript = `(function(){document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`;

export const metadata: Metadata = {
	metadataBase: new URL(SITE_ORIGIN),
	title: { default: SITE_TITLE, template: `%s | ${SITE_TITLE}` },
	description: SITE_DESCRIPTION,
	openGraph: { siteName: SITE_TITLE, locale: "ja_JP", type: "website" },
	alternates: { types: { "application/rss+xml": `${SITE_ORIGIN}/rss.xml` } },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html className="scroll-auto" lang="ja" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/cat.png" type="image/png"></link>
			</head>
			<body className="flex min-h-screen flex-col bg-surface font-sans text-base leading-6 text-site-text">
				<Script id="theme-initializer" strategy="beforeInteractive">{themeScript}</Script>
				<a className="skip-link fixed top-3 left-3 z-100 -translate-y-[180%] rounded-md bg-action px-4 py-3 text-sm font-semibold text-on-action focus:translate-y-0" href="#main-content">本文へ移動</a>
				<SiteHeader />
				{children}
				<SiteFooter />
			</body>
		</html>
	);
}
