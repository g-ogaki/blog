import { describe, expect, it, vi } from "vitest";
import { handleModerateComment } from "./moderation-api";

function request(body: unknown) {
	return new Request("https://monipy.org/api/comments/moderate", {
		body: JSON.stringify(body),
		method: "POST",
	});
}

describe("comment moderation API", () => {
	it.each(["approve", "reject"] as const)("confirms a valid %s action", async (action) => {
		const moderate = vi.fn().mockResolvedValue({ status: action === "approve" ? "approved" : "rejected" });
		const response = await handleModerateComment(request({ action, token: "opaque-token" }), {
			db: {} as D1Database,
			moderate,
		});
		expect(response.status).toBe(200);
		expect(moderate).toHaveBeenCalledWith(expect.anything(), { action, token: "opaque-token" });
	});

	it("uses the same response for unknown, expired, and used tokens", async () => {
		const response = await handleModerateComment(request({ action: "approve", token: "unavailable" }), {
			db: {} as D1Database,
			moderate: vi.fn().mockResolvedValue(null),
		});
		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({ success: false, error: "Review link is unavailable." });
	});

	it("rejects an invalid action without querying D1", async () => {
		const moderate = vi.fn();
		const response = await handleModerateComment(request({ action: "delete", token: "token" }), {
			db: {} as D1Database,
			moderate,
		});
		expect(response.status).toBe(400);
		expect(moderate).not.toHaveBeenCalled();
	});
});
