import { moderateComment, type ModerationAction } from "./repository";

interface ModerationApiDependencies {
	db: D1Database;
	moderate?: typeof moderateComment;
}

function json(body: unknown, status: number) {
	return Response.json(body, { status });
}

export async function handleModerateComment(request: Request, dependencies: ModerationApiDependencies) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: "Invalid action." }, 400);
	}

	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return json({ success: false, error: "Invalid action." }, 400);
	}

	const { action, token } = body as { action?: unknown; token?: unknown };
	if (action !== "approve" && action !== "reject") {
		return json({ success: false, error: "Invalid action." }, 400);
	}
	if (typeof token !== "string" || token.length < 1 || token.length > 256) {
		return json({ success: false, error: "Review link is unavailable." }, 404);
	}

	const moderate = dependencies.moderate ?? moderateComment;
	const comment = await moderate(dependencies.db, { action: action as ModerationAction, token });
	if (!comment) return json({ success: false, error: "Review link is unavailable." }, 404);

	return json({ success: true, status: comment.status }, 200);
}
