import { describe, expect, it, vi } from "vitest";
import { TurnstileUnavailableError, verifyTurnstile } from "./turnstile";

describe("Turnstile verification", () => {
	it("sends the token, secret, and trusted IP to Siteverify", async () => {
		const fetcher = vi.fn().mockResolvedValue(Response.json({ success: true }));
		await expect(
			verifyTurnstile({
				fetcher,
				ipAddress: "203.0.113.8",
				secretKey: "secret",
				token: "token",
			}),
		).resolves.toBe(true);

		expect(fetcher).toHaveBeenCalledOnce();
		const [url, init] = fetcher.mock.calls[0];
		expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
		expect(JSON.parse(init.body)).toEqual({ remoteip: "203.0.113.8", response: "token", secret: "secret" });
	});

	it("treats transport and malformed responses as unavailable", async () => {
		for (const response of [new Response(null, { status: 503 }), Response.json({ malformed: true })]) {
			await expect(
				verifyTurnstile({ fetcher: vi.fn().mockResolvedValue(response), ipAddress: "ip", secretKey: "s", token: "t" }),
			).rejects.toBeInstanceOf(TurnstileUnavailableError);
		}
	});
});
