import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`;

export const metadata: Metadata = {
	metadataBase: new URL("https://monipy.org"),
	title: { default: "moni's page", template: "%s | moni's page" },
	description: "moniが技術や日々の学びを記録する個人サイトです。",
	openGraph: { siteName: "moni's page", locale: "ja_JP", type: "website" },
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
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<a className="skip-link" href="#main-content">本文へ移動</a>
				<SiteHeader />
				{children}
				<SiteFooter />
			</body>
		</html>
	);
}
