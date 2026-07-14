import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { verifyRelease } from "../../../scripts/verify-release";

const temporaryDirectories: string[] = [];

function createReleaseFixture() {
	const root = mkdtempSync(path.join(tmpdir(), "monipy-release-"));
	temporaryDirectories.push(root);

	const files: Record<string, string> = {
		".open-next/worker.js": "export default {};",
		".open-next/assets/BUILD_ID": "build-123\n",
		".open-next/assets/rss.xml": "<rss />",
		".open-next/assets/sitemap.xml": "<urlset />",
		".open-next/assets/robots.txt": "User-agent: *",
		".open-next/assets/cat.jpg": "image",
		".open-next/assets/_headers": [
			"/_next/static/*",
			"  Cache-Control: public,max-age=31536000,immutable",
			"/rss.xml",
			"  Content-Type: application/rss+xml; charset=utf-8",
		].join("\n"),
		".open-next/assets/pagefind-loader.js": "export {};",
		".open-next/assets/pagefind/pagefind-entry.json": "{}",
		".open-next/assets/pagefind/index/ja.pf_index": "index",
		".open-next/cache/build-123/index.cache": "home",
		".open-next/cache/build-123/blog.cache": "blog",
		".open-next/cache/build-123/blog/2026/example.cache": "post",
		"src/generated/published-posts.json": JSON.stringify([{ slug: "2026/example" }]),
		"wrangler.jsonc": JSON.stringify({
			main: "custom-worker.ts",
			assets: { binding: "ASSETS", directory: ".open-next/assets" },
			images: { binding: "IMAGES" },
			services: [{ binding: "WORKER_SELF_REFERENCE", service: "blog" }],
			triggers: { crons: ["0 3 * * *"] },
			secrets: { required: ["DISCORD_WEBHOOK_URL", "TURNSTILE_SECRET_KEY", "IP_HASH_SECRET"] },
			d1_databases: [{ binding: "DB", database_name: "blog" }],
		}),
	};

	for (const [relativePath, contents] of Object.entries(files)) {
		const filePath = path.join(root, relativePath);
		mkdirSync(path.dirname(filePath), { recursive: true });
		writeFileSync(filePath, contents);
	}

	return root;
}

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

describe("verifyRelease", () => {
	it("accepts a complete Worker release", () => {
		expect(verifyRelease(createReleaseFixture())).toBe(1);
	});

	it("rejects a release missing a published post cache", () => {
		const root = createReleaseFixture();
		rmSync(path.join(root, ".open-next/cache/build-123/blog/2026/example.cache"));

		expect(() => verifyRelease(root)).toThrow("post cache for 2026/example");
	});

	it("rejects a release missing its Pagefind index", () => {
		const root = createReleaseFixture();
		rmSync(path.join(root, ".open-next/assets/pagefind/index/ja.pf_index"));

		expect(() => verifyRelease(root)).toThrow("Pagefind index");
	});

	it("rejects a release missing a required Worker binding", () => {
		const root = createReleaseFixture();
		writeFileSync(path.join(root, "wrangler.jsonc"), "{}");

		expect(() => verifyRelease(root)).toThrow("DB binding");
	});
});
