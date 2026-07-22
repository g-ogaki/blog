import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import type { Link, Root, Text } from "mdast";
import { Parser } from "htmlparser2";
import ipaddr from "ipaddr.js";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 512 * 1024;
const DEFAULT_MAX_REDIRECTS = 3;
const redirectStatuses = new Set([301, 302, 303, 307, 308]);

export interface LinkPreview {
	url: string;
	title: string;
	description?: string;
	image?: string;
	siteName?: string;
	provider: string;
}

export type LinkPreviewMetadata = Omit<LinkPreview, "url">;

export type LinkPreviewLoader = (url: string) => Promise<LinkPreview | null>;

export interface PreviewResponse {
	statusCode: number;
	headers: Record<string, string | undefined>;
	body: AsyncIterable<Uint8Array>;
}

interface LinkPreviewDependencies {
	maxBytes?: number;
	maxRedirects?: number;
	request?: (url: URL, address: string, signal: AbortSignal) => Promise<PreviewResponse>;
	resolveHostname?: (hostname: string) => Promise<string[]>;
	timeoutMs?: number;
}

function normalizeHostname(hostname: string) {
	return hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
}

export function isPublicIpAddress(address: string) {
	try {
		const parsed = ipaddr.parse(address);
		if (parsed instanceof ipaddr.IPv6 && parsed.isIPv4MappedAddress()) {
			return parsed.toIPv4Address().range() === "unicast";
		}
		return parsed.range() === "unicast";
	} catch {
		return false;
	}
}

async function resolvePublicAddresses(hostname: string) {
	const normalizedHostname = normalizeHostname(hostname);
	if (isIP(normalizedHostname)) {
		return isPublicIpAddress(normalizedHostname) ? [normalizedHostname] : [];
	}

	const addresses = await lookup(normalizedHostname, { all: true, verbatim: true });
	return addresses.map(({ address }) => address);
}

function firstHeader(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function requestPinned(url: URL, address: string, signal: AbortSignal) {
	return new Promise<PreviewResponse>((resolve, reject) => {
		const request = httpsRequest(
			{
				agent: false,
				hostname: address,
				port: url.port || 443,
				path: `${url.pathname}${url.search}`,
				method: "GET",
				servername: url.hostname,
				signal,
				headers: {
					accept: "text/html,application/xhtml+xml",
					"accept-encoding": "identity",
					connection: "close",
					host: url.host,
					"user-agent": "monipy-link-preview/1.0",
				},
			},
			(response) => {
				const headers = Object.fromEntries(
					Object.entries(response.headers).map(([key, value]) => [key, firstHeader(value)]),
				);
				resolve({ statusCode: response.statusCode ?? 0, headers, body: response });
			},
		);
		request.on("error", reject);
		request.end();
	});
}

async function readLimitedHead(response: PreviewResponse, maxBytes: number) {
	const iterator = response.body[Symbol.asyncIterator]();
	let buffer = Buffer.alloc(0);
	let completed = false;
	try {
		while (true) {
			const next = await iterator.next();
			if (next.done) {
				completed = true;
				return new TextDecoder().decode(buffer);
			}

			buffer = Buffer.concat([buffer, Buffer.from(next.value)]);
			const boundedBuffer = buffer.subarray(0, Math.min(buffer.byteLength, maxBytes));
			const html = new TextDecoder().decode(boundedBuffer);
			const closingHead = /<\/head\s*>/iu.exec(html);
			if (closingHead?.index !== undefined) {
				return html.slice(0, closingHead.index + closingHead[0].length);
			}
			if (buffer.byteLength > maxBytes) return null;
		}
	} finally {
		if (!completed) await iterator.return?.();
	}
}

async function releaseBody(body: AsyncIterable<Uint8Array>) {
	await body[Symbol.asyncIterator]().return?.();
}

function abortable<T>(operation: Promise<T>, signal: AbortSignal) {
	if (signal.aborted) return Promise.reject(signal.reason);
	return new Promise<T>((resolve, reject) => {
		const abort = () => reject(signal.reason);
		signal.addEventListener("abort", abort, { once: true });
		operation.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
	});
}

function metadataFromHtml(html: string) {
	const metadata = new Map<string, string>();
	let title = "";
	let inTitle = false;
	const parser = new Parser(
		{
			onopentag(name, attributes) {
				if (name === "title") {
					inTitle = true;
				}
				if (name !== "meta" || !attributes.content) {
					return;
				}
				const key = (attributes.property ?? attributes.name)?.toLowerCase();
				if (key && !metadata.has(key)) {
					metadata.set(key, attributes.content.trim());
				}
			},
			ontext(value) {
				if (inTitle) title += value;
			},
			onclosetag(name) {
				if (name === "title") inTitle = false;
			},
		},
		{ decodeEntities: true },
	);
	parser.end(html);

	return {
		title: metadata.get("og:title") || metadata.get("twitter:title") || title.trim(),
		description:
			metadata.get("og:description") || metadata.get("twitter:description") || metadata.get("description"),
		image: metadata.get("og:image") || metadata.get("twitter:image"),
		siteName: metadata.get("og:site_name"),
	};
}

function providerName(url: URL, siteName?: string) {
	const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
	if (hostname === "github.com") return "GitHub";
	if (hostname === "x.com" || hostname === "twitter.com") return "X";
	if (hostname === "youtu.be" || hostname === "youtube.com") return "YouTube";
	return siteName || hostname;
}

function safeHttpsUrl(value: string | undefined, baseUrl: URL) {
	if (!value) return undefined;
	try {
		const url = new URL(value, baseUrl);
		return url.protocol === "https:" ? url.href : undefined;
	} catch {
		return undefined;
	}
}

export function extractStandaloneLinkUrls(markdown: string) {
	const tree = unified().use(remarkParse).parse(markdown) as Root;
	const urls: string[] = [];
	const seen = new Set<string>();
	visit(tree, "paragraph", (paragraph) => {
		if (paragraph.children.length !== 1 || paragraph.children[0].type !== "text") return;
		const value = (paragraph.children[0] as Text).value.trim();
		try {
			const url = new URL(value);
			if (url.protocol === "https:" && !seen.has(value)) {
				seen.add(value);
				urls.push(value);
			}
		} catch {
			// Ordinary paragraphs are not link-card candidates.
		}
	});
	return urls;
}

export function extractStandaloneInternalLinkUrls(markdown: string) {
	const tree = unified().use(remarkParse).parse(markdown) as Root;
	const urls: string[] = [];
	visit(tree, "paragraph", (paragraph) => {
		if (paragraph.children.length !== 1 || paragraph.children[0].type !== "link") return;
		const url = (paragraph.children[0] as Link).url;
		if ((url.startsWith("/blog/") || url.startsWith("/en/blog/")) && !urls.includes(url)) urls.push(url);
	});
	return urls;
}

export function remarkMarkInternalLinkCards() {
	return (tree: Root) => {
		visit(tree, "paragraph", (paragraph) => {
			if (paragraph.children.length !== 1 || paragraph.children[0].type !== "link") return;
			const url = (paragraph.children[0] as Link).url;
			if (!url.startsWith("/blog/") && !url.startsWith("/en/blog/")) return;
			paragraph.data = {
				...paragraph.data,
				hProperties: { ...paragraph.data?.hProperties, "data-internal-link-card": url },
			};
		});
	};
}

export async function loadLinkPreview(urlValue: string, dependencies: LinkPreviewDependencies = {}) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(new Error("link preview timed out")), dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS);
	const resolveHostname = dependencies.resolveHostname ?? resolvePublicAddresses;
	const request = dependencies.request ?? requestPinned;
	try {
		let url = new URL(urlValue);
		for (let redirectCount = 0; redirectCount <= (dependencies.maxRedirects ?? DEFAULT_MAX_REDIRECTS); redirectCount += 1) {
			if (url.protocol !== "https:" || url.username || url.password) return null;
			const addresses = await abortable(resolveHostname(normalizeHostname(url.hostname)), controller.signal);
			if (addresses.length === 0 || addresses.some((address) => !isPublicIpAddress(address))) return null;
			const response = await abortable(request(url, addresses[0], controller.signal), controller.signal);
			if (redirectStatuses.has(response.statusCode)) {
				const location = response.headers.location;
				await releaseBody(response.body);
				if (!location || redirectCount === (dependencies.maxRedirects ?? DEFAULT_MAX_REDIRECTS)) return null;
				url = new URL(location, url);
				continue;
			}
			if (response.statusCode !== 200 || !response.headers["content-type"]?.toLowerCase().includes("text/html")) {
				await releaseBody(response.body);
				return null;
			}
			const html = await abortable(
				readLimitedHead(response, dependencies.maxBytes ?? DEFAULT_MAX_BYTES),
				controller.signal,
			);
			if (html === null) return null;
			const metadata = metadataFromHtml(html);
			if (!metadata.title) return null;
			return {
				url: urlValue,
				title: metadata.title,
				description: metadata.description || undefined,
				image: safeHttpsUrl(metadata.image, url),
				siteName: metadata.siteName || undefined,
				provider: providerName(url, metadata.siteName),
			};
		}
		return null;
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}
