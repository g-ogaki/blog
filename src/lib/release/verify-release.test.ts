import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
		".open-next/assets/en/rss.xml": "<rss />",
		".open-next/assets/sitemap.xml": "<urlset />",
		".open-next/assets/robots.txt": "User-agent: *",
		".open-next/assets/cat.jpg": "image",
		".open-next/assets/_headers": [
			"/_next/static/*",
			"  Cache-Control: public,max-age=31536000,immutable",
			"/rss.xml",
			"  Content-Type: application/rss+xml; charset=utf-8",
			"/en/rss.xml",
			"  Content-Type: application/rss+xml; charset=utf-8",
		].join("\n"),
		".open-next/assets/pagefind-loader.js": "export {};",
		".open-next/assets/pagefind/pagefind-entry.json": "{}",
		".open-next/assets/pagefind/index/ja_fixture.pf_index": "index",
		".open-next/assets/pagefind/index/en_fixture.pf_index": "index",
		".open-next/cache/build-123/index.cache": "home",
		".open-next/cache/build-123/blog.cache": "blog",
		".open-next/cache/build-123/en.cache": "home-en",
		".open-next/cache/build-123/en/blog.cache": "blog-en",
		".open-next/cache/build-123/blog/2026/example.cache": "post",
		".open-next/cache/build-123/en/blog/2026/example.cache": "post-en",
		"src/generated/published-posts.json": JSON.stringify([{ slug: "2026/example", translations: { ja: { url: "/blog/2026/example" }, en: { url: "/en/blog/2026/example" } } }]),
		"wrangler.jsonc": JSON.stringify({
			main: "custom-worker.ts",
			assets: { binding: "ASSETS", directory: ".open-next/assets" },
			ai_search: [{ binding: "BLOG_HELPER", instance_name: "blog-helper", remote: true }],
			images: { binding: "IMAGES" },
			ratelimits: [{ name: "CHAT_RATE_LIMITER", namespace_id: "49001", simple: { limit: 5, period: 60 } }],
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

		expect(() => verifyRelease(root)).toThrow("Japanese post cache for 2026/example");
	});

	it("rejects a release missing its Pagefind index", () => {
		const root = createReleaseFixture();
		rmSync(path.join(root, ".open-next/assets/pagefind/index/ja_fixture.pf_index"));

		expect(() => verifyRelease(root)).toThrow("Pagefind ja index");
	});

	it("rejects a release missing a required Worker binding", () => {
		const root = createReleaseFixture();
		writeFileSync(path.join(root, "wrangler.jsonc"), "{}");

		expect(() => verifyRelease(root)).toThrow("DB binding");
	});

	it("rejects a release missing the homepage AI bindings", () => {
		const root = createReleaseFixture();
		const configPath = path.join(root, "wrangler.jsonc");
		const config = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
		delete config.ai_search;
		delete config.ratelimits;
		writeFileSync(configPath, JSON.stringify(config));

		expect(() => verifyRelease(root)).toThrow("BLOG_HELPER AI Search binding");
	});
});
