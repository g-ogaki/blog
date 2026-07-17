"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

const themeOptions: { label: string; value: Theme }[] = [
	{ label: "ライト", value: "light" },
	{ label: "ダーク", value: "dark" },
	{ label: "システム", value: "system" },
];

function SearchIcon() {
	return (
		<svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-4-4" />
		</svg>
	);
}

function GlobeIcon() {
	return (
		<svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="9" />
			<path d="M3 12h18M12 3c2.5 2.5 3.75 5.5 3.75 9S14.5 18.5 12 21M12 3C9.5 5.5 8.25 8.5 8.25 12S9.5 18.5 12 21" />
		</svg>
	);
}

function SunIcon() {
	return (
		<svg aria-hidden="true" className="theme-icon theme-icon--sun" fill="none" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
		</svg>
	);
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
	const menu = event.currentTarget;
	const items = [...menu.querySelectorAll<HTMLButtonElement>(selector)];
	if (!items.length) return;
	const current = items.indexOf(document.activeElement as HTMLButtonElement);
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

function LanguageControl() {
	const { close, containerRef, open, setOpen, triggerRef } = usePopupMenu();
	const openMenu = () => {
		setOpen(true);
		requestAnimationFrame(() => containerRef.current?.querySelector<HTMLButtonElement>("[role='menuitemradio']:not([aria-disabled='true'])")?.focus());
	};
	return (
		<div className="header-menu" ref={containerRef}>
			<button
				aria-controls="language-menu"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label="表示言語を変更"
				className="header-icon-button"
				onClick={() => open ? close() : openMenu()}
				onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); openMenu(); } }}
				ref={triggerRef}
				type="button"
			>
				<GlobeIcon />
			</button>
			{open ? (
				<div aria-label="表示言語" className="header-popup" id="language-menu" onKeyDown={(event) => moveMenuFocus(event, "[role='menuitemradio']:not([aria-disabled='true'])", close)} role="menu">
					<button aria-checked="true" onClick={() => close(true)} role="menuitemradio" tabIndex={-1} type="button"><span>日本語</span><span className="menu-state">選択中</span></button>
					<button aria-checked="false" aria-disabled="true" lang="en" role="menuitemradio" tabIndex={-1} type="button"><span>English</span><span className="menu-availability">準備中</span></button>
				</div>
			) : null}
		</div>
	);
}

function ThemeControl() {
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
		<div className="header-menu" ref={containerRef}>
			<button
				aria-controls="theme-menu"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label="表示テーマを変更"
				className="header-icon-button"
				onClick={() => open ? close() : openMenu()}
				onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); openMenu(); } }}
				ref={triggerRef}
				type="button"
			>
				<SunIcon /><MoonIcon />
			</button>
			{open ? (
				<div aria-label="表示テーマ" className="header-popup" id="theme-menu" onKeyDown={(event) => moveMenuFocus(event, "[role='menuitemradio']", close)} role="menu">
					{themeOptions.map((option) => (
						<button aria-checked={theme === option.value} key={option.value} onClick={() => selectTheme(option.value)} role="menuitemradio" tabIndex={-1} type="button" value={option.value}>
							<span>{option.label}</span><span className="menu-state">{theme === option.value ? "選択中" : ""}</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

export function SiteHeader() {
	const pathname = usePathname() ?? "/";
	const isHome = pathname === "/";
	const isArchive = pathname === "/blog";
	const isBlog = pathname.startsWith("/blog");

	return (
		<header className={`site-header${isArchive ? " site-header--archive" : ""}`}>
			<div className="shell site-header-inner">
				<Link className="wordmark" href="/">moni&apos;s page</Link>
				<div className="header-actions">
					<nav className="primary-nav" aria-label="メインナビゲーション">
						<ul>
							<li><Link aria-current={isHome ? "page" : undefined} href="/">ホーム</Link></li>
							<li><Link aria-current={isBlog ? "page" : undefined} href="/blog">ブログ</Link></li>
						</ul>
					</nav>
					{isArchive ? null : (
						<form action="/blog" className="header-search" role="search">
							<label className="sr-only" htmlFor="header-search-input">ブログを検索</label>
							<SearchIcon />
							<input id="header-search-input" name="q" placeholder="検索" type="search" />
						</form>
					)}
					<div className="header-utilities"><LanguageControl /><ThemeControl /></div>
				</div>
			</div>
		</header>
	);
}
