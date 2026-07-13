import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { Image, Link, Root } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const postDirectoryPattern = /^(\d{8})-(.+)$/;
const yearDirectoryPattern = /^\d{4}$/;

const postMetadataSchema = z
	.object({
		title: z.string().trim().min(1),
		date: z.string().regex(datePattern, "must use YYYY-MM-DD format"),
		category: z.string().trim().min(1),
		tags: z.array(z.string().trim().min(1)),
		summary: z.string().trim().min(1),
		draft: z.boolean(),
		image: z.string().trim().min(1).optional(),
	})
	.strict();

export type PostMetadata = z.infer<typeof postMetadataSchema>;

export interface Post {
	content: string;
	directoryName: string;
	metadata: PostMetadata;
	slug: string;
	sourcePath: string;
	url: string;
	year: string;
}

export interface LoadPostsOptions {
	contentDirectory?: string;
	includeDrafts?: boolean;
}

export class ContentValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ContentValidationError";
	}
}

function fail(sourcePath: string, message: string): never {
	throw new ContentValidationError(`${sourcePath}: ${message}`);
}

function isCalendarDate(value: string) {
	if (!datePattern.test(value)) {
		return false;
	}

	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function splitFrontmatter(source: string, sourcePath: string) {
	const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
	if (!match) {
		fail(sourcePath, "must start with YAML frontmatter enclosed by --- markers");
	}

	return {
		frontmatter: match[1],
		content: source.slice(match[0].length).replace(/^\r?\n/, ""),
	};
}

function parseMetadata(frontmatter: string, sourcePath: string) {
	let value: unknown;
	try {
		value = parseYaml(frontmatter);
	} catch (error) {
		fail(sourcePath, `contains invalid YAML: ${error instanceof Error ? error.message : String(error)}`);
	}

	const result = postMetadataSchema.safeParse(value);
	if (!result.success) {
		const issues = result.error.issues
			.map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
			.join("; ");
		fail(sourcePath, `contains invalid frontmatter (${issues})`);
	}

	if (!isCalendarDate(result.data.date)) {
		fail(sourcePath, `frontmatter date "${result.data.date}" must be a valid calendar date`);
	}

	return result.data;
}

function discoverPostFiles(contentDirectory: string) {
	if (!existsSync(contentDirectory)) {
		return [];
	}

	const sourcePaths: string[] = [];
	for (const yearEntry of readdirSync(contentDirectory, { withFileTypes: true })) {
		if (!yearEntry.isDirectory()) {
			continue;
		}
		if (!yearDirectoryPattern.test(yearEntry.name)) {
			fail(path.join(contentDirectory, yearEntry.name), "year directory must use YYYY format");
		}

		const yearDirectory = path.join(contentDirectory, yearEntry.name);
		for (const postEntry of readdirSync(yearDirectory, { withFileTypes: true })) {
			if (!postEntry.isDirectory()) {
				continue;
			}
			if (!postDirectoryPattern.test(postEntry.name)) {
				fail(path.join(yearDirectory, postEntry.name), "post directory must use YYYYMMDD-slug format");
			}

			const sourcePath = path.join(yearDirectory, postEntry.name, "index.md");
			if (!existsSync(sourcePath)) {
				fail(sourcePath, "post directory must contain index.md");
			}
			sourcePaths.push(sourcePath);
		}
	}

	return sourcePaths;
}

function loadPost(sourcePath: string, contentDirectory: string): Post {
	const postDirectory = path.dirname(sourcePath);
	const directoryName = path.basename(postDirectory);
	const year = path.basename(path.dirname(postDirectory));
	const directoryMatch = postDirectoryPattern.exec(directoryName);
	if (!directoryMatch) {
		fail(sourcePath, "post directory must use YYYYMMDD-slug format");
	}

	const { content, frontmatter } = splitFrontmatter(readFileSync(sourcePath, "utf8"), sourcePath);
	const metadata = parseMetadata(frontmatter, sourcePath);
	const directoryDate = directoryMatch[1];
	const frontmatterDate = metadata.date.replaceAll("-", "");
	if (directoryDate !== frontmatterDate || year !== metadata.date.slice(0, 4)) {
		fail(sourcePath, "directory year and date prefix must match frontmatter date");
	}

	if (metadata.image) {
		validateLocalFile(metadata.image, postDirectory, sourcePath, "frontmatter image");
	}

	const slug = path.relative(contentDirectory, postDirectory).split(path.sep).join("/");
	return {
		content,
		directoryName,
		metadata,
		slug,
		sourcePath,
		url: `/blog/${slug}`,
		year,
	};
}

function cleanReference(reference: string, sourcePath: string) {
	const withoutQueryOrFragment = reference.split(/[?#]/, 1)[0];
	try {
		return decodeURIComponent(withoutQueryOrFragment);
	} catch {
		fail(sourcePath, `reference "${reference}" contains invalid URL encoding`);
	}
}

function validateLocalFile(reference: string, postDirectory: string, sourcePath: string, label: string) {
	const cleanedReference = cleanReference(reference, sourcePath);
	if (!cleanedReference || cleanedReference.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(cleanedReference)) {
		fail(sourcePath, `${label} "${reference}" must reference a file colocated with the post`);
	}

	const resolvedPath = path.resolve(postDirectory, cleanedReference);
	const relativePath = path.relative(postDirectory, resolvedPath);
	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
		fail(sourcePath, `${label} "${reference}" must remain inside the post directory`);
	}
	if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) {
		fail(sourcePath, `${label} "${reference}" does not exist`);
	}
}

function validateMarkdownReferences(post: Post, availablePostUrls: ReadonlySet<string>) {
	let tree: Root;
	try {
		tree = unified().use(remarkParse).parse(post.content);
	} catch (error) {
		fail(post.sourcePath, `contains invalid Markdown: ${error instanceof Error ? error.message : String(error)}`);
	}

	const validateReference = (node: Link | Image) => {
		const reference = node.url;
		if (node.type === "image") {
			validateLocalFile(reference, path.dirname(post.sourcePath), post.sourcePath, "Markdown image");
			return;
		}
		if (!reference || reference.startsWith("#") || reference.startsWith("//")) {
			return;
		}
		if (/^[a-z][a-z\d+.-]*:/i.test(reference)) {
			return;
		}

		const cleanedReference = cleanReference(reference, post.sourcePath).replace(/\/$/, "");
		if (cleanedReference.startsWith("/blog/")) {
			if (!availablePostUrls.has(cleanedReference)) {
				fail(post.sourcePath, `internal link "${reference}" does not identify a post`);
			}
			return;
		}
		if (cleanedReference.startsWith("/")) {
			return;
		}

		validateLocalFile(reference, path.dirname(post.sourcePath), post.sourcePath, "relative link");
	};

	visit(tree, "link", validateReference);
	visit(tree, "image", validateReference);
}

export function validateUniquePostUrls(posts: readonly Pick<Post, "sourcePath" | "url">[]) {
	const sourcePathByUrl = new Map<string, string>();
	for (const post of posts) {
		const normalizedUrl = post.url.toLowerCase();
		const existingSourcePath = sourcePathByUrl.get(normalizedUrl);
		if (existingSourcePath) {
			throw new ContentValidationError(
				`duplicate post URL "${post.url}" in ${existingSourcePath} and ${post.sourcePath}`,
			);
		}
		sourcePathByUrl.set(normalizedUrl, post.sourcePath);
	}
}

export function loadPosts(options: LoadPostsOptions = {}) {
	const contentDirectory = path.resolve(options.contentDirectory ?? path.join(process.cwd(), "content", "posts"));
	const includeDrafts = options.includeDrafts ?? process.env.NODE_ENV !== "production";
	const posts = discoverPostFiles(contentDirectory).map((sourcePath) => loadPost(sourcePath, contentDirectory));
	validateUniquePostUrls(posts);

	const visiblePosts = posts.filter((post) => includeDrafts || !post.metadata.draft);
	const allPostUrls = new Set(posts.map((post) => post.url));
	const publishedPostUrls = new Set(posts.filter((post) => !post.metadata.draft).map((post) => post.url));
	for (const post of posts) {
		const availablePostUrls = includeDrafts || post.metadata.draft ? allPostUrls : publishedPostUrls;
		validateMarkdownReferences(post, availablePostUrls);
	}

	return visiblePosts.sort((left, right) => right.metadata.date.localeCompare(left.metadata.date));
}
