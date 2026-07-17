import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_DESCRIPTION, SITE_ORIGIN, SITE_TITLE } from "@/lib/site";
import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`;

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
		<html lang="ja" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body>
				<Script id="theme-initializer" strategy="beforeInteractive">{themeScript}</Script>
				<a className="skip-link" href="#main-content">本文へ移動</a>
				<SiteHeader />
				{children}
				<SiteFooter />
			</body>
		</html>
	);
}
