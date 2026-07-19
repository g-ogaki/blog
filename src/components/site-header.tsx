"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import publishedPostManifest from "@/generated/published-posts.json";
import { blogPath, getDictionary, homePath, otherLocale, type Locale } from "@/lib/i18n";
import { localeCookieName } from "@/lib/locale-routing";

type Theme = "light" | "dark" | "system";

function SearchIcon() {
	return <svg aria-hidden="true" className="pointer-events-none absolute left-3 size-4 stroke-text-muted" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

function GlobeIcon() {
	return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.75 5.5 3.75 9S14.5 18.5 12 21M12 3C9.5 5.5 8.25 8.5 8.25 12S9.5 18.5 12 21" /></svg>;
}

function SunIcon() {
	return <svg aria-hidden="true" className="theme-icon theme-icon--sun" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></svg>;
}

function MoonIcon() {
	return <svg aria-hidden="true" className="theme-icon theme-icon--moon" fill="none" viewBox="0 0 24 24"><path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z" /></svg>;
}

function getThemeSnapshot(): Theme {
	try {
		const value = localStorage.getItem("theme");
		return value === "light" || value === "dark" ? value : "system";
	} catch {
		return "system";
	}
}

function subscribeToTheme(callback: () => void) {
	window.addEventListener("storage", callback);
	window.addEventListener("themechange", callback);
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener("themechange", callback);
	};
}

function applyTheme(theme: Theme) {
	if (theme === "system") document.documentElement.removeAttribute("data-theme");
	else document.documentElement.dataset.theme = theme;
}

function usePopupMenu() {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (!open) return;
		const closeOutside = (event: PointerEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", closeOutside);
		return () => document.removeEventListener("pointerdown", closeOutside);
	}, [open]);
	const close = (returnFocus = false) => {
		setOpen(false);
		if (returnFocus) requestAnimationFrame(() => triggerRef.current?.focus());
	};
	return { close, containerRef, open, setOpen, triggerRef };
}

function moveMenuFocus(event: React.KeyboardEvent, selector: string, close: (returnFocus?: boolean) => void) {
	const items = [...event.currentTarget.querySelectorAll<HTMLElement>(selector)];
	if (!items.length) return;
	const current = items.indexOf(document.activeElement as HTMLElement);
	if (event.key === "Escape") {
		event.preventDefault();
		close(true);
	} else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
		event.preventDefault();
		const offset = event.key === "ArrowDown" ? 1 : -1;
		items[(current + offset + items.length) % items.length].focus();
	} else if (event.key === "Home" || event.key === "End") {
		event.preventDefault();
		items[event.key === "Home" ? 0 : items.length - 1].focus();
	}
}

const triggerClass = "grid size-11 cursor-pointer place-items-center rounded-md border border-control-border bg-transparent p-0 text-site-text hover:bg-hover-surface aria-expanded:bg-hover-surface motion-safe:transition-colors motion-safe:duration-150 [&_svg]:size-5 [&_svg]:stroke-current";
const menuClass = "z-30 grid min-w-40 gap-1 rounded-md border border-site-border bg-surface-raised p-1.5 shadow-sm";
const menuButtonClass = "flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-md border-0 bg-transparent px-3 text-left text-sm font-medium text-text-muted no-underline hover:bg-hover-surface hover:text-site-text focus-visible:bg-hover-surface focus-visible:text-site-text aria-checked:bg-selected-surface aria-checked:font-semibold aria-checked:text-action";

function translationForPath(pathname: string) {
	return publishedPostManifest.find((article) =>
		Object.values(article.translations).some((translation) => translation?.url === pathname),
	);
}

export function localizedTarget(pathname: string, locale: Locale) {
	if (pathname === "/" || pathname === "/en") return { available: true, path: homePath(locale) };
	if (pathname === "/blog" || pathname === "/en/blog") return { available: true, path: blogPath(locale) };
	const article = translationForPath(pathname);
	const translation = article?.translations[locale as keyof typeof article.translations];
	return translation
		? { available: true, path: translation.url }
		: { available: false, path: article ? pathname : homePath(locale) };
}

function preferenceHref(locale: Locale, redirect: string) {
	return `/language/${locale}?redirect=${encodeURIComponent(redirect)}`;
}

function LanguageControl({ locale, pathname, viewportBound }: { locale: Locale; pathname: string; viewportBound: boolean }) {
	const copy = getDictionary(locale).language;
	const { close, containerRef, open, setOpen, triggerRef } = usePopupMenu();
	const openMenu = () => {
		setOpen(true);
		requestAnimationFrame(() => containerRef.current?.querySelector<HTMLElement>("[role='menuitemradio']")?.focus());
	};
	return (
		<div className="language-control relative" ref={containerRef}>
			<button aria-controls="language-menu" aria-expanded={open} aria-haspopup="menu" aria-label={copy.change} className={`language-trigger ${triggerClass}`} onClick={() => open ? close() : openMenu()} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); openMenu(); } }} ref={triggerRef} type="button"><GlobeIcon /></button>
			{open ? (
				<div aria-label={copy.menu} className={`language-menu ${menuClass} ${viewportBound ? "fixed right-4 left-4 sm:absolute sm:top-[calc(100%+0.5rem)] sm:right-0 sm:left-auto" : "absolute top-[calc(100%+0.5rem)] right-0"}`} id="language-menu" onKeyDown={(event) => moveMenuFocus(event, "[role='menuitemradio']", close)} role="menu">
					{(["ja", "en"] as const).map((option) => {
						const target = localizedTarget(pathname, option).path;
						return <a aria-checked={locale === option} className={menuButtonClass} href={preferenceHref(option, target)} key={option} lang={option} role="menuitemradio" tabIndex={-1}><span>{option === "ja" ? copy.japanese : copy.english}</span><span className="language-state text-xs font-medium">{locale === option ? copy.selected : ""}</span></a>;
					})}
				</div>
			) : null}
		</div>
	);
}

function ThemeControl({ locale, viewportBound }: { locale: Locale; viewportBound: boolean }) {
	const copy = getDictionary(locale).theme;
	const themeOptions: { label: string; value: Theme }[] = [
		{ label: copy.light, value: "light" },
		{ label: copy.dark, value: "dark" },
		{ label: copy.system, value: "system" },
	];
	const theme = useSyncExternalStore<Theme>(subscribeToTheme, getThemeSnapshot, () => "system");
	const { close, containerRef, open, setOpen, triggerRef } = usePopupMenu();
	const openMenu = () => {
		setOpen(true);
		requestAnimationFrame(() => containerRef.current?.querySelector<HTMLButtonElement>(`[value='${theme}']`)?.focus());
	};
	const selectTheme = (nextTheme: Theme) => {
		try {
			if (nextTheme === "system") localStorage.removeItem("theme");
			else localStorage.setItem("theme", nextTheme);
		} catch {}
		applyTheme(nextTheme);
		window.dispatchEvent(new Event("themechange"));
		close(true);
	};
	return (
		<div className="theme-control relative" ref={containerRef}>
			<button aria-controls="theme-menu" aria-expanded={open} aria-haspopup="menu" aria-label={copy.change} className={`theme-trigger ${triggerClass}`} onClick={() => open ? close() : openMenu()} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); openMenu(); } }} ref={triggerRef} type="button"><SunIcon /><MoonIcon /></button>
			{open ? (
				<div aria-label={copy.menu} className={`theme-menu ${menuClass} ${viewportBound ? "fixed right-4 left-4 sm:absolute sm:top-[calc(100%+0.5rem)] sm:right-0 sm:left-auto" : "absolute top-[calc(100%+0.5rem)] right-0"}`} id="theme-menu" onKeyDown={(event) => moveMenuFocus(event, "[role='menuitemradio']", close)} role="menu">
					{themeOptions.map((option) => <button aria-checked={theme === option.value} className={menuButtonClass} key={option.value} onClick={() => selectTheme(option.value)} role="menuitemradio" tabIndex={-1} type="button" value={option.value}><span>{option.label}</span><span className="theme-state text-xs font-medium">{theme === option.value ? copy.selected : ""}</span></button>)}
				</div>
			) : null}
		</div>
	);
}

export function LanguageSuggestion({ locale }: { locale: Locale }) {
	const pathname = usePathname() ?? homePath(locale);
	const [dismissed, setDismissed] = useState(false);
	const targetLocale = otherLocale(locale);
	const target = localizedTarget(pathname, targetLocale);
	const copy = getDictionary(targetLocale).suggestion;
	const visible = useSyncExternalStore(() => () => {}, () => {
		const saved = document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${localeCookieName}=`))?.split("=")[1];
		const preferred = saved === "ja" || saved === "en"
			? saved
			: navigator.languages.map((language) => language.toLowerCase().split("-")[0]).find((language) => language === "ja" || language === "en");
		return preferred === targetLocale;
	}, () => false);
	if (!visible || dismissed) return null;
	return (
		<div className="border-b border-site-border bg-selected-surface px-4 py-3 text-sm text-site-text" role="note">
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 sm:px-2">
				<p className="m-0" lang={targetLocale}>{target.available ? <a className="font-semibold" href={preferenceHref(targetLocale, target.path)}>{copy.translated}</a> : copy.unavailable}</p>
				<button aria-label={copy.close} className="cursor-pointer border-0 bg-transparent p-2 text-lg leading-none" onClick={() => setDismissed(true)} type="button">×</button>
			</div>
		</div>
	);
}

export function SiteHeader({ locale = "ja" }: { locale?: Locale }) {
	const pathname = usePathname() ?? homePath(locale);
	const copy = getDictionary(locale);
	const localeHome = homePath(locale);
	const localeBlog = blogPath(locale);
	const isHome = pathname === localeHome;
	const isArchive = pathname === localeBlog;
	const isBlog = pathname === localeBlog || pathname.startsWith(`${localeBlog}/`);
	const innerClass = isArchive
		? "grid min-h-16 grid-cols-[minmax(0,1fr)_auto] [grid-template-areas:'wordmark_nav'_'utilities_utilities'] gap-x-4 gap-y-3 py-3 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:py-0"
		: "grid min-h-16 grid-cols-[minmax(0,1fr)_auto] [grid-template-areas:'brand_navigation'_'search_utilities'] gap-3 py-4 md:flex md:items-center md:justify-between md:gap-6 md:py-0";
	const navigationLinkClass = `inline-flex min-h-11 items-center whitespace-nowrap rounded-md py-2 text-sm font-medium no-underline hover:bg-hover-surface aria-[current=page]:bg-selected-surface aria-[current=page]:font-semibold aria-[current=page]:text-action motion-safe:transition-colors motion-safe:duration-150 ${isArchive ? "px-2 sm:px-3" : "px-3"}`;
	return (
		<header className={`site-header relative z-20 border-b border-site-border bg-surface${isArchive ? " site-header--archive" : ""}`}>
			<div className={`site-header__inner mx-auto w-full max-w-7xl px-4 sm:px-6 ${innerClass}`}>
				<Link className={`wordmark whitespace-nowrap text-base font-semibold tracking-tight no-underline ${isArchive ? "[grid-area:wordmark] sm:[grid-area:auto]" : "[grid-area:brand] md:[grid-area:auto]"}`} href={localeHome}>moni&apos;s page</Link>
				<div className={`header-actions contents ${isArchive ? "sm:flex sm:min-w-0 sm:items-center sm:gap-6" : "md:flex md:min-w-0 md:items-center md:gap-6"}`}>
					<nav className={`primary-nav justify-self-end ${isArchive ? "[grid-area:nav] sm:[grid-area:auto]" : "[grid-area:navigation] md:[grid-area:auto]"}`} aria-label={copy.navigation.label}>
						<ul className={`m-0 flex list-none flex-nowrap items-center gap-1 p-0 ${isArchive ? "sm:gap-5" : "md:gap-5"}`}><li><Link aria-current={isHome ? "page" : undefined} className={navigationLinkClass} href={localeHome}>{copy.navigation.home}</Link></li><li><Link aria-current={isBlog ? "page" : undefined} className={navigationLinkClass} href={localeBlog}>{copy.navigation.blog}</Link></li></ul>
					</nav>
					{isArchive ? null : <form action={localeBlog} className="header-search relative flex min-w-0 items-center [grid-area:search] md:w-auto md:[grid-area:auto]" role="search"><label className="sr-only" htmlFor="header-search-input">{copy.headerSearch.label}</label><SearchIcon /><input className="h-11 w-full rounded-md border border-control-border bg-surface-raised py-2 pr-3 pl-9 text-sm text-site-text placeholder:text-text-muted md:w-56" id="header-search-input" name="q" placeholder={copy.headerSearch.placeholder} type="search" /></form>}
					<div className={`header-utilities flex items-center justify-self-end gap-3 ${isArchive ? "[grid-area:utilities] sm:[grid-area:auto]" : "[grid-area:utilities] md:[grid-area:auto]"}`}><LanguageControl locale={locale} pathname={pathname} viewportBound={!isArchive} /><ThemeControl locale={locale} viewportBound={!isArchive} /></div>
				</div>
			</div>
		</header>
	);
}
