import {
	CommentRateLimitError,
	createPendingComment,
	listApprovedComments,
	rollbackPendingComment,
	type PublicComment,
} from "./repository";
import { sendDiscordCommentNotification } from "./discord";
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

export interface CommentReadDependencies {
	db: D1Database;
	findPublishedPost: (slug: string) => PublishedPostReference | undefined;
	listComments?: typeof listApprovedComments;
}

export interface CommentApiDependencies extends CommentReadDependencies {
	createComment?: typeof createPendingComment;
	createToken?: typeof createModerationToken;
	discordWebhookUrl: string;
	ipHashSecret: string;
	moderationUrl: string;
	notifyModerator?: typeof sendDiscordCommentNotification;
	rollbackComment?: typeof rollbackPendingComment;
	turnstileSecretKey: string;
	verifyChallenge?: typeof verifyTurnstile;
}

export interface PublishedPostReference {
	slug: string;
	title: string;
	url: string;
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
	if (!parsed) return invalidInput();
	const post = dependencies.findPublishedPost(parsed.post_slug);
	if (!post) return invalidInput();

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
	const approveToken = createToken();
	const rejectToken = createToken();
	let storedComment;
	try {
		storedComment = await createComment(dependencies.db, {
			approveToken,
			comment: parsed.comment,
			ipAddress,
			ipHashSecret: dependencies.ipHashSecret,
			name: parsed.name.trim(),
			postSlug: parsed.post_slug,
			rejectToken,
		});
	} catch (error) {
		if (error instanceof CommentRateLimitError) {
			return json({ success: false, error: "Daily comment limit reached." }, 429);
		}
		throw error;
	}

	const notifyModerator = dependencies.notifyModerator ?? sendDiscordCommentNotification;
	try {
		await notifyModerator({
			approveToken,
			comment: storedComment.comment,
			moderationUrl: dependencies.moderationUrl,
			name: storedComment.name,
			postTitle: post.title,
			postUrl: post.url,
			rejectToken,
			webhookUrl: dependencies.discordWebhookUrl,
		});
	} catch (error) {
		const rollbackComment = dependencies.rollbackComment ?? rollbackPendingComment;
		await rollbackComment(dependencies.db, storedComment);
		throw error;
	}

	return json({ success: true }, 201);
}

export async function handleGetComments(request: Request, dependencies: CommentReadDependencies) {
	const post = new URL(request.url).searchParams.get("post");
	if (!isValidPostSlug(post) || !dependencies.findPublishedPost(post)) return invalidInput();

	const listComments = dependencies.listComments ?? listApprovedComments;
	const comments: PublicComment[] = await listComments(dependencies.db, post);
	return json({ comments });
}
