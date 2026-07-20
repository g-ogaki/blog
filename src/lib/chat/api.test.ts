import { describe, expect, it, vi } from "vitest";
import { handleChatRequest, type ChatDependencies } from "./api";

const encoder = new TextEncoder();

function nativeStream(parts: string[]) {
	return new ReadableStream({
		start(controller) {
			for (const part of parts) controller.enqueue(encoder.encode(part));
			controller.close();
		},
	});
}

function nativeReply(answer = "Relevant answer") {
	return nativeStream([
		'event: chunks\ndata: [{"item":{"key":"https://monipy.org/blog/2026/post","metadata":{"title":"A post"}}},{"item":{"key":"https://monipy.org/blog/2026/post"}},{"item":{"key":"https://evil.example/unsafe"}}]\n\n',
		`data: ${JSON.stringify({ choices: [{ delta: { content: answer } }] })}\n\n`,
		"data: [DONE]\n\n",
	]);
}

function request(body: unknown, headers: Record<string, string> = {}) {
	return new Request("https://monipy.org/api/chat", {
		body: JSON.stringify(body),
		headers: {
			"cf-connecting-ip": "203.0.113.8",
			"content-type": "application/json",
			origin: "https://monipy.org",
			...headers,
		},
		method: "POST",
	});
}

function dependencies(overrides: Partial<ChatDependencies> = {}): ChatDependencies {
	return {
		chatCompletions: vi.fn().mockResolvedValue(nativeReply()),
		rateLimit: vi.fn().mockResolvedValue({ success: true }),
		...overrides,
	};
}

describe("chat API", () => {
	it("injects the server prompt and transforms provider SSE into bounded text and trusted citations", async () => {
		const chatCompletions = vi.fn().mockResolvedValue(nativeReply());
		const response = await handleChatRequest(request({
			locale: "ja",
			messages: [
				{ content: "前の質問", role: "user" },
				{ content: "前の回答", role: "assistant" },
				{ content: "関連記事は？", role: "user" },
			],
		}), dependencies({ chatCompletions }));

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/event-stream");
		const providerRequest = chatCompletions.mock.calls[0][0];
		expect(providerRequest.stream).toBe(true);
		expect(providerRequest.max_tokens).toBe(256);
		expect(providerRequest.messages[0]).toMatchObject({ role: "system" });
		expect(providerRequest.messages.at(-1)).toEqual({ content: "関連記事は？", role: "user" });

		const output = await response.text();
		expect(output).toContain('event: delta\ndata: {"text":"Relevant answer"}');
		expect(output).toContain('"title":"A post","url":"https://monipy.org/blog/2026/post"');
		expect(output).not.toContain("evil.example");
		expect(output.match(/https:\/\/monipy.org\/blog\/2026\/post/g)).toHaveLength(1);
		expect(output).toContain("event: done");
	});

	it("rejects cross-origin, malformed, oversized, and privileged-role input before consuming quota", async () => {
		const rateLimit = vi.fn().mockResolvedValue({ success: true });
		const cases = [
			request({ locale: "ja", messages: [{ content: "hello", role: "system" }] }),
			request({ locale: "ja", messages: [{ content: "x".repeat(201), role: "user" }] }),
			request({ locale: "ja", messages: [{ content: "hello", role: "user" }, { content: "extra", role: "user" }] }),
			request({ locale: "ja", messages: [{ content: "hello", role: "user" }] }, { origin: "https://evil.example" }),
		];

		for (const candidate of cases) {
			const response = await handleChatRequest(candidate, dependencies({ rateLimit }));
			expect([400, 403]).toContain(response.status);
		}
		expect(rateLimit).not.toHaveBeenCalled();
	});

	it("requires Cloudflare's trusted client IP and enforces its rate-limit result", async () => {
		const missingIp = request({ locale: "en", messages: [{ content: "Hello", role: "user" }] });
		missingIp.headers.delete("cf-connecting-ip");
		expect((await handleChatRequest(missingIp, dependencies())).status).toBe(503);

		const response = await handleChatRequest(
			request({ locale: "en", messages: [{ content: "Hello", role: "user" }] }),
			dependencies({ rateLimit: vi.fn().mockResolvedValue({ success: false }) }),
		);
		expect(response.status).toBe(429);
		expect(await response.json()).toEqual({ error: "rate_limited", success: false });
	});

	it("maps provider startup failures without exposing their details", async () => {
		const response = await handleChatRequest(
			request({ locale: "en", messages: [{ content: "Hello", role: "user" }] }),
			dependencies({ chatCompletions: vi.fn().mockRejectedValue(new Error("secret upstream detail")) }),
		);
		expect(response.status).toBe(503);
		expect(await response.json()).toEqual({ error: "unavailable", success: false });
	});

	it("times out a provider that does not start", async () => {
		const neverStarts: ChatDependencies["chatCompletions"] = () => new Promise<ReadableStream>(() => undefined);
		const response = await handleChatRequest(
			request({ locale: "en", messages: [{ content: "Hello", role: "user" }] }),
			dependencies({ chatCompletions: neverStarts, timeoutMs: 5 }),
		);
		expect(response.status).toBe(504);
		expect(await response.json()).toEqual({ error: "timeout", success: false });
	});

	it("emits a bounded stream error for malformed or incomplete provider output", async () => {
		for (const stream of [nativeStream(["data: not-json\n\n"]), nativeStream(["data: {}\n\n"])]) {
			const response = await handleChatRequest(
				request({ locale: "en", messages: [{ content: "Hello", role: "user" }] }),
				dependencies({ chatCompletions: vi.fn().mockResolvedValue(stream) }),
			);
			const output = await response.text();
			expect(output).toContain('event: error\ndata: {"code":"provider_unavailable"}');
			expect(output).not.toContain("secret");
		}
	});

	it("cuts off generated output at 600 Unicode characters", async () => {
		const response = await handleChatRequest(
			request({ locale: "en", messages: [{ content: "Hello", role: "user" }] }),
			dependencies({ chatCompletions: vi.fn().mockResolvedValue(nativeReply("界".repeat(700))) }),
		);
		const output = await response.text();
		const delta = output.match(/event: delta\ndata: ({.*})/)?.[1];
		expect(Array.from((JSON.parse(delta ?? "{}") as { text: string }).text)).toHaveLength(600);
		expect(output).toContain('event: done\ndata: {"truncated":true}');
	});
});
