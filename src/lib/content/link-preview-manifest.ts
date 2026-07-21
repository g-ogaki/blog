import generatedLinkPreviews from "@/generated/link-previews.json";
import { z } from "zod";
import {
	extractStandaloneLinkUrls,
	type LinkPreview,
	type LinkPreviewLoader,
	type LinkPreviewMetadata,
} from "./link-preview";
import type { Post } from "./posts";

const httpsUrlSchema = z.string().refine((value) => {
	try {
		const url = new URL(value);
		return url.protocol === "https:" && !url.username && !url.password;
	} catch {
		return false;
	}
}, "must be an HTTPS URL without credentials");

const metadataSchema = z.object({
	title: z.string().trim().min(1),
	description: z.string().trim().min(1).optional(),
	image: httpsUrlSchema.optional(),
	siteName: z.string().trim().min(1).optional(),
	provider: z.string().trim().min(1),
}).strict();

const manifestSchema = z.record(httpsUrlSchema, metadataSchema);

export type LinkPreviewManifest = Record<string, LinkPreviewMetadata>;

export interface RefreshLinkPreviewManifestResult {
	manifest: LinkPreviewManifest;
	refreshed: readonly string[];
	retained: readonly string[];
}

export class LinkPreviewManifestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "LinkPreviewManifestError";
	}
}

export function parseLinkPreviewManifest(value: unknown): LinkPreviewManifest {
	const result = manifestSchema.safeParse(value);
	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `${issue.path.join(".") || "manifest"}: ${issue.message}`)
			.join("; ");
		throw new LinkPreviewManifestError(`invalid link preview manifest (${issues})`);
	}
	return result.data;
}

export function collectPublishedLinkPreviewUrls(posts: readonly Pick<Post, "content" | "sourcePath">[]) {
	const sourcePathsByUrl = new Map<string, string[]>();
	for (const post of posts) {
		for (const url of extractStandaloneLinkUrls(post.content)) {
			const sourcePaths = sourcePathsByUrl.get(url) ?? [];
			if (!sourcePaths.includes(post.sourcePath)) sourcePaths.push(post.sourcePath);
			sourcePathsByUrl.set(url, sourcePaths);
		}
	}
	return sourcePathsByUrl;
}

export function validateLinkPreviewManifest(
	posts: readonly Pick<Post, "content" | "sourcePath">[],
	value: unknown,
) {
	const manifest = parseLinkPreviewManifest(value);
	const references = collectPublishedLinkPreviewUrls(posts);
	const missing = [...references]
		.filter(([url]) => !manifest[url])
		.map(([url, sourcePaths]) => `${url} (${sourcePaths.join(", ")})`);
	if (missing.length > 0) {
		throw new LinkPreviewManifestError(
			`missing generated metadata for published link preview${missing.length === 1 ? "" : "s"}: ${missing.join("; ")}. Run npm run refresh:link-previews.`,
		);
	}
	return manifest;
}

export function createManifestLinkPreviewLoader(value: unknown): LinkPreviewLoader {
	const manifest = parseLinkPreviewManifest(value);
	return async (url) => {
		const metadata = manifest[url];
		return metadata ? { url, ...metadata } : null;
	};
}

export const loadGeneratedLinkPreview = createManifestLinkPreviewLoader(generatedLinkPreviews);

function metadataFromPreview(preview: LinkPreview): LinkPreviewMetadata {
	return {
		title: preview.title,
		description: preview.description,
		image: preview.image,
		siteName: preview.siteName,
		provider: preview.provider,
	};
}

export async function refreshLinkPreviewManifest(
	posts: readonly Pick<Post, "content" | "sourcePath">[],
	existingValue: unknown,
	loadPreview: LinkPreviewLoader,
	options: { attempts?: number; concurrency?: number } = {},
): Promise<RefreshLinkPreviewManifestResult> {
	const existing = parseLinkPreviewManifest(existingValue);
	const urls = [...collectPublishedLinkPreviewUrls(posts).keys()].sort();
	const refreshed = new Set<string>();
	const retained = new Set<string>();
	const metadataByUrl = new Map<string, LinkPreviewMetadata>();
	const attempts = Math.max(1, options.attempts ?? 2);
	let cursor = 0;

	const worker = async () => {
		while (cursor < urls.length) {
			const url = urls[cursor];
			cursor += 1;
			let preview: LinkPreview | null = null;
			for (let attempt = 0; attempt < attempts && !preview; attempt += 1) {
				preview = await loadPreview(url);
			}
			if (preview) {
				metadataByUrl.set(url, metadataFromPreview(preview));
				refreshed.add(url);
			} else if (existing[url]) {
				metadataByUrl.set(url, existing[url]);
				retained.add(url);
			}
		}
	};

	const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, urls.length || 1));
	await Promise.all(Array.from({ length: concurrency }, worker));
	const missing = urls.filter((url) => !metadataByUrl.has(url));
	if (missing.length > 0) {
		throw new LinkPreviewManifestError(
			`could not fetch uncached link preview${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
		);
	}

	return {
		manifest: Object.fromEntries(urls.map((url) => [url, metadataByUrl.get(url)!])),
		refreshed: [...refreshed].sort(),
		retained: [...retained].sort(),
	};
}

export function serializeLinkPreviewManifest(manifest: LinkPreviewManifest) {
	const sorted = Object.fromEntries(Object.entries(manifest).sort(([left], [right]) => left.localeCompare(right)));
	return `${JSON.stringify(sorted, null, 2)}\n`;
}
