export const SITE_ORIGIN = "https://monipy.org";
export const SITE_TITLE = "moni's page";
export const SITE_AUTHOR = "moni";
export const SITE_DESCRIPTION = "moniが技術や日々の学びを記録する個人サイトです。";

export function absoluteUrl(pathname: string) {
	return pathname === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${pathname}`;
}
