"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

const themes: { label: string; shortLabel: string; value: Theme }[] = [
	{ label: "ライト", shortLabel: "L", value: "light" },
	{ label: "ダーク", shortLabel: "D", value: "dark" },
	{ label: "システム設定", shortLabel: "A", value: "system" },
];

function applyTheme(theme: Theme) {
	if (theme === "system") {
		document.documentElement.removeAttribute("data-theme");
		return;
	}
	document.documentElement.dataset.theme = theme;
}

function getThemeSnapshot(): Theme {
	const storedTheme = localStorage.getItem("theme");
	return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";
}

function subscribeToTheme(callback: () => void) {
	window.addEventListener("storage", callback);
	window.addEventListener("themechange", callback);
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener("themechange", callback);
	};
}

export function ThemeSwitcher() {
	const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "system");

	function selectTheme(nextTheme: Theme) {
		localStorage.setItem("theme", nextTheme);
		applyTheme(nextTheme);
		window.dispatchEvent(new Event("themechange"));
	}

	return (
		<fieldset className="theme-switcher">
			<legend className="visually-hidden">表示テーマ</legend>
			{themes.map((option) => (
				<label key={option.value} title={option.label}>
					<input
						checked={theme === option.value}
						name="theme"
						onChange={() => selectTheme(option.value)}
						type="radio"
						value={option.value}
					/>
					<span aria-hidden="true">{option.shortLabel}</span>
					<span className="visually-hidden">{option.label}</span>
				</label>
			))}
		</fieldset>
	);
}
