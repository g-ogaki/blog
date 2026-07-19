import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

type PublishedPost = {
	slug: string;
	translations: Partial<Record<"ja" | "en", { url: string }>>;
};

type WranglerConfig = {
	main?: string;
	assets?: { binding?: string; directory?: string };
	images?: { binding?: string };
	services?: Array<{ binding?: string; service?: string }>;
	triggers?: { crons?: string[] };
	secrets?: { required?: string[] };
	d1_databases?: Array<{ binding?: string; database_name?: string }>;
};

function requireFile(filePath: string, label: string) {
	if (!existsSync(filePath) || !statSync(filePath).isFile() || statSync(filePath).size === 0) {
		throw new Error(`Missing or empty ${label}: ${filePath}`);
	}
}

function requireMatchingFile(directory: string, suffix: string, label: string) {
	if (!existsSync(directory) || !readdirSync(directory).some((name) => name.endsWith(suffix))) {
		throw new Error(`Missing ${label} in ${directory}`);
	}
}

function requireLanguageIndex(directory: string, locale: "ja" | "en") {
	if (!existsSync(directory) || !readdirSync(directory).some((name) => name.startsWith(`${locale}_`) && name.endsWith(".pf_index"))) {
		throw new Error(`Missing Pagefind ${locale} index in ${directory}`);
	}
}

function verifyWranglerConfig(rootDirectory: string) {
	const configPath = path.join(rootDirectory, "wrangler.jsonc");
	requireFile(configPath, "Wrangler configuration");
	const parsed = ts.parseConfigFileTextToJson(configPath, readFileSync(configPath, "utf8"));
	if (parsed.error) {
		throw new Error(`Invalid Wrangler configuration: ${parsed.error.messageText}`);
	}

	const config = parsed.config as WranglerConfig;
	const checks: Array<[boolean, string]> = [
		[config.main === "custom-worker.ts", "custom Worker entry point"],
		[config.assets?.binding === "ASSETS" && config.assets.directory === ".open-next/assets", "ASSETS binding"],
		[config.images?.binding === "IMAGES", "IMAGES binding"],
		[
			config.services?.some(
				(service) => service.binding === "WORKER_SELF_REFERENCE" && service.service === "blog",
			) === true,
			"WORKER_SELF_REFERENCE binding",
		],
		[
			config.d1_databases?.some((database) => database.binding === "DB" && database.database_name === "blog") ===
				true,
			"DB binding",
		],
		[config.triggers?.crons?.includes("0 3 * * *") === true, "daily cleanup Cron Trigger"],
	];

	for (const secret of ["DISCORD_WEBHOOK_URL", "TURNSTILE_SECRET_KEY", "IP_HASH_SECRET"]) {
		checks.push([config.secrets?.required?.includes(secret) === true, `required secret ${secret}`]);
	}

	const missing = checks.filter(([present]) => !present).map(([, label]) => label);
	if (missing.length > 0) {
		throw new Error(`Wrangler configuration is missing: ${missing.join(", ")}`);
	}
}

export function verifyRelease(rootDirectory: string) {
	verifyWranglerConfig(rootDirectory);
	const outputDirectory = path.join(rootDirectory, ".open-next");
	const assetsDirectory = path.join(outputDirectory, "assets");
	const manifestPath = path.join(rootDirectory, "src", "generated", "published-posts.json");

	requireFile(path.join(outputDirectory, "worker.js"), "OpenNext Worker entry point");
	requireFile(path.join(assetsDirectory, "rss.xml"), "RSS feed");
	requireFile(path.join(assetsDirectory, "en", "rss.xml"), "English RSS feed");
	requireFile(path.join(assetsDirectory, "sitemap.xml"), "sitemap");
	requireFile(path.join(assetsDirectory, "robots.txt"), "robots file");
	requireFile(path.join(assetsDirectory, "cat.jpg"), "default Open Graph image");
	requireFile(path.join(assetsDirectory, "pagefind-loader.js"), "Pagefind loader");
	requireFile(path.join(assetsDirectory, "pagefind", "pagefind-entry.json"), "Pagefind entry");
	const pagefindIndexDirectory = path.join(assetsDirectory, "pagefind", "index");
	requireMatchingFile(pagefindIndexDirectory, ".pf_index", "Pagefind index");
	requireLanguageIndex(pagefindIndexDirectory, "ja");
	requireLanguageIndex(pagefindIndexDirectory, "en");
	requireFile(manifestPath, "published-post manifest");

	const headers = readFileSync(path.join(assetsDirectory, "_headers"), "utf8");
	if (!headers.includes("Cache-Control: public,max-age=31536000,immutable")) {
		throw new Error("Static asset cache header is missing from the Worker release");
	}
	if (!headers.includes("Content-Type: application/rss+xml; charset=utf-8")) {
		throw new Error("RSS content-type header is missing from the Worker release");
	}
	if (!headers.includes("/en/rss.xml")) {
		throw new Error("English RSS content-type header is missing from the Worker release");
	}

	const buildId = readFileSync(path.join(assetsDirectory, "BUILD_ID"), "utf8").trim();
	if (!buildId) {
		throw new Error("OpenNext BUILD_ID is empty");
	}

	const cacheDirectory = path.join(outputDirectory, "cache", buildId);
	requireFile(path.join(cacheDirectory, "index.cache"), "home page cache");
	requireFile(path.join(cacheDirectory, "blog.cache"), "blog index cache");
	requireFile(path.join(cacheDirectory, "en.cache"), "English home page cache");
	requireFile(path.join(cacheDirectory, "en", "blog.cache"), "English blog index cache");

	const posts = JSON.parse(readFileSync(manifestPath, "utf8")) as PublishedPost[];
	for (const post of posts) {
		if (post.translations.ja) requireFile(path.join(cacheDirectory, "blog", `${post.slug}.cache`), `Japanese post cache for ${post.slug}`);
		if (post.translations.en) requireFile(path.join(cacheDirectory, "en", "blog", `${post.slug}.cache`), `English post cache for ${post.slug}`);
	}

	return posts.length;
}

const isCommand = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCommand) {
	const postCount = verifyRelease(process.cwd());
	console.log(`Verified Worker release artifacts for ${postCount} published posts.`);
}
