import type { Metadata } from "next";
import Script from "next/script";
import { LanguageSuggestion, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { feedPath, getDictionary, homePath, type Locale } from "@/lib/i18n";
import { SITE_ORIGIN, SITE_TITLE } from "@/lib/site";

const themeScript = `(function(){document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`;

export function localizedRootMetadata(locale: Locale): Metadata {
	const dictionary = getDictionary(locale);
	return {
		metadataBase: new URL(SITE_ORIGIN),
		title: { default: SITE_TITLE, template: `%s | ${SITE_TITLE}` },
		description: dictionary.siteDescription,
		openGraph: {
			siteName: SITE_TITLE,
			locale: locale === "ja" ? "ja_JP" : "en_US",
			alternateLocale: [locale === "ja" ? "en_US" : "ja_JP"],
			type: "website",
		},
		alternates: {
			canonical: homePath(locale),
			languages: { ja: "/", en: "/en", "x-default": "/" },
			types: { "application/rss+xml": `${SITE_ORIGIN}${feedPath(locale)}` },
		},
		icons: { icon: [{ url: "/cat.png", type: "image/png" }] },
	};
}

export function SiteDocument({ children, locale }: { children: React.ReactNode; locale: Locale }) {
	const dictionary = getDictionary(locale);
	return (
		<html className="scroll-auto" lang={locale} suppressHydrationWarning>
			<body className="flex min-h-screen flex-col bg-surface font-sans text-base leading-6 text-site-text">
				{/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
				<Script id="theme-initializer" strategy="beforeInteractive">{themeScript}</Script>
				<a className="skip-link fixed top-3 left-3 z-100 -translate-y-[180%] rounded-md bg-action px-4 py-3 text-sm font-semibold text-on-action focus:translate-y-0" href="#main-content">{dictionary.skipLink}</a>
				<SiteHeader locale={locale} />
				<LanguageSuggestion locale={locale} />
				{children}
				<SiteFooter locale={locale} />
			</body>
		</html>
	);
}
