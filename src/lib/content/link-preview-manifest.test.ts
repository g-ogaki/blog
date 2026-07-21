import { describe, expect, it, vi } from "vitest";
import type { Post } from "./posts";
import {
	createManifestLinkPreviewLoader,
	parseLinkPreviewManifest,
	refreshLinkPreviewManifest,
	serializeLinkPreviewManifest,
	validateLinkPreviewManifest,
} from "./link-preview-manifest";

function post(sourcePath: string, content: string) {
	return { content, sourcePath } as Post;
}

const cachedPreview = {
	title: "Cached title",
	description: "Cached description",
	provider: "Example",
};

describe("link preview manifest", () => {
	it("validates HTTPS metadata and reports missing published URLs with their source", () => {
		const posts = [post("content/posts/example/index.md", "https://example.com/article\n")];
		expect(() => validateLinkPreviewManifest(posts, {})).toThrow(
			/content\/posts\/example\/index\.md.*npm run refresh:link-previews/,
		);
		expect(() => parseLinkPreviewManifest({
			"https://example.com/article": { ...cachedPreview, image: "http://example.com/image.png" },
		})).toThrow(/image.*HTTPS URL/);
	});

	it("loads saved metadata while keeping the authored URL as the card destination", async () => {
		const loadPreview = createManifestLinkPreviewLoader({
			"https://example.com/original": cachedPreview,
		});

		await expect(loadPreview("https://example.com/original")).resolves.toEqual({
			url: "https://example.com/original",
			...cachedPreview,
		});
		await expect(loadPreview("https://example.com/missing")).resolves.toBeNull();
	});

	it("refreshes unique URLs, retains cached failures, and prunes stale entries", async () => {
		const posts = [
			post("ja.md", "https://example.com/fresh\n\nhttps://example.com/cached\n"),
			post("en.md", "https://example.com/fresh\n"),
		];
		const loadPreview = vi.fn(async (url: string) => url.endsWith("fresh") ? {
			url: "https://redirect.example/temporary",
			title: "Fresh title",
			provider: "Example",
		} : null);

		const result = await refreshLinkPreviewManifest(posts, {
			"https://example.com/cached": cachedPreview,
			"https://example.com/stale": { title: "Stale", provider: "Example" },
		}, loadPreview, { attempts: 2, concurrency: 2 });

		expect(loadPreview).toHaveBeenCalledTimes(3);
		expect(result.refreshed).toEqual(["https://example.com/fresh"]);
		expect(result.retained).toEqual(["https://example.com/cached"]);
		expect(result.manifest).toEqual({
			"https://example.com/cached": cachedPreview,
			"https://example.com/fresh": { title: "Fresh title", provider: "Example" },
		});
		expect(serializeLinkPreviewManifest(result.manifest)).toBe(`${JSON.stringify(result.manifest, null, 2)}\n`);
	});

	it("rejects a refresh when a new uncached URL remains unavailable", async () => {
		await expect(refreshLinkPreviewManifest(
			[post("new.md", "https://example.com/new\n")],
			{},
			async () => null,
			{ attempts: 2 },
		)).rejects.toThrow(/uncached.*https:\/\/example\.com\/new/);
	});
});
