export interface PagefindResultData {
	meta: Record<string, string>;
	plain_excerpt: string;
	url: string;
}

interface PagefindResult {
	data(): Promise<PagefindResultData>;
}

export interface PagefindApi {
	filters(): Promise<Record<string, Record<string, number>>>;
	init(): Promise<void>;
	search(
		query: string | null,
		options: { filters: Record<string, string | string[]> },
	): Promise<{ results: PagefindResult[] }>;
}

declare global {
	interface Window {
		__monipyPagefind?: PagefindApi;
	}
}

let pagefindPromise: Promise<PagefindApi> | undefined;

export function loadPagefind() {
	if (window.__monipyPagefind) return Promise.resolve(window.__monipyPagefind);
	if (pagefindPromise) return pagefindPromise;

	pagefindPromise = new Promise<PagefindApi>((resolve, reject) => {
		const ready = () => {
			if (window.__monipyPagefind) resolve(window.__monipyPagefind);
			else reject(new Error("Pagefind loaded without exposing its API"));
		};
		window.addEventListener("monipy:pagefind-ready", ready, { once: true });

		const script = document.createElement("script");
		script.type = "module";
		script.src = "/pagefind-loader.js";
		script.addEventListener("error", () => reject(new Error("Pagefind assets are unavailable")), { once: true });
		document.head.appendChild(script);
	});

	return pagefindPromise;
}
