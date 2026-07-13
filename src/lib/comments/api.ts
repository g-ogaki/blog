import {
	CommentRateLimitError,
	createPendingComment,
	listApprovedComments,
	type PublicComment,
} from "./repository";
import { createModerationToken } from "./tokens";
import { verifyTurnstile } from "./turnstile";

const postSlugPattern = /^\d{4}\/\d{8}-[^/\\]+$/;
const submissionKeys = new Set(["comment", "name", "post_slug", "turnstile_token"]);

interface CommentSubmission {
	comment: string;
	name: string;
	post_slug: string;
	turnstile_token: string;
}

function isValidText(value: unknown, maximumLength: number) {
	return typeof value === "string" && value.length >= 1 && value.length <= maximumLength && value.trim().length > 0;
}

function isValidPostSlug(value: unknown): value is string {
	return typeof value === "string" && value.length <= 200 && postSlugPattern.test(value);
}

function parseSubmission(value: unknown): CommentSubmission | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const record = value as Record<string, unknown>;
	const keys = Object.keys(record);
	if (keys.length !== submissionKeys.size || keys.some((key) => !submissionKeys.has(key))) return null;
	if (
		!isValidText(record.comment, 2_000) ||
		!isValidText(record.name, 80) ||
		!isValidPostSlug(record.post_slug) ||
		!isValidText(record.turnstile_token, 2_048)
	) {
		return null;
	}

	return record as unknown as CommentSubmission;
}

export interface CommentApiDependencies {
	createComment?: typeof createPendingComment;
	createToken?: typeof createModerationToken;
	db: D1Database;
	ipHashSecret: string;
	isPublishedPost: (slug: string) => boolean;
	listComments?: typeof listApprovedComments;
	turnstileSecretKey: string;
	verifyChallenge?: typeof verifyTurnstile;
}

function json(body: unknown, status = 200) {
	return Response.json(body, { status });
}

function invalidInput() {
	return json({ success: false, error: "Invalid input." }, 400);
}

export async function handlePostComment(request: Request, dependencies: CommentApiDependencies) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return invalidInput();
	}

	const parsed = parseSubmission(body);
	if (!parsed || !dependencies.isPublishedPost(parsed.post_slug)) return invalidInput();

	const ipAddress = request.headers.get("cf-connecting-ip");
	if (!ipAddress) return json({ success: false, error: "Comment service is unavailable." }, 500);

	const verifyChallenge = dependencies.verifyChallenge ?? verifyTurnstile;
	const verified = await verifyChallenge({
		ipAddress,
		secretKey: dependencies.turnstileSecretKey,
		token: parsed.turnstile_token,
	});
	if (!verified) return json({ success: false, error: "Turnstile verification failed." }, 403);

	const createToken = dependencies.createToken ?? createModerationToken;
	const createComment = dependencies.createComment ?? createPendingComment;
	try {
		await createComment(dependencies.db, {
			approveToken: createToken(),
			comment: parsed.comment,
			ipAddress,
			ipHashSecret: dependencies.ipHashSecret,
			name: parsed.name.trim(),
			postSlug: parsed.post_slug,
			rejectToken: createToken(),
		});
	} catch (error) {
		if (error instanceof CommentRateLimitError) {
			return json({ success: false, error: "Daily comment limit reached." }, 429);
		}
		throw error;
	}

	return json({ success: true }, 201);
}

export async function handleGetComments(request: Request, dependencies: CommentApiDependencies) {
	const post = new URL(request.url).searchParams.get("post");
	if (!isValidPostSlug(post) || !dependencies.isPublishedPost(post)) return invalidInput();

	const listComments = dependencies.listComments ?? listApprovedComments;
	const comments: PublicComment[] = await listComments(dependencies.db, post);
	return json({ comments });
}
