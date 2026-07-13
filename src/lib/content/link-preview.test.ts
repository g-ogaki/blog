import { describe, expect, it, vi } from "vitest";
import {
	extractStandaloneLinkUrls,
	isPublicIpAddress,
	loadLinkPreview,
	type PreviewResponse,
} from "./link-preview";

function response(
	body: string,
	options: { statusCode?: number; headers?: Record<string, string> } = {},
): PreviewResponse {
	return {
		statusCode: options.statusCode ?? 200,
		headers: { "content-type": "text/html", ...options.headers },
		body: (async function* () {
			yield new TextEncoder().encode(body);
		})(),
	};
}

describe("extractStandaloneLinkUrls", () => {
	it("returns unique standalone HTTPS paragraphs and ignores inline or non-HTTPS URLs", () => {
		expect(
			extractStandaloneLinkUrls(
				"https://example.com\n\nInline https://example.com/inline stays text.\n\nhttp://example.com\n\nhttps://example.com",
			),
		).toEqual(["https://example.com"]);
	});
});

describe("isPublicIpAddress", () => {
	it.each([
		["93.184.216.34", true],
		["10.0.0.1", false],
		["127.0.0.1", false],
		["169.254.169.254", false],
		["192.168.1.1", false],
		["::1", false],
		["fc00::1", false],
		["fe80::1", false],
		["::ffff:127.0.0.1", false],
	])("classifies %s", (address, expected) => {
		expect(isPublicIpAddress(address)).toBe(expected);
	});
});

describe("loadLinkPreview", () => {
	it("pins requests to validated addresses and extracts provider metadata", async () => {
		const request = vi.fn(async () =>
			response(`
				<title>HTML title</title>
				<meta property="og:title" content="Open Graph title">
				<meta property="og:description" content="Preview description">
				<meta property="og:image" content="/card.png">
				<meta property="og:site_name" content="Example Site">
			`),
		);

		const preview = await loadLinkPreview("https://github.com/example/project", {
			resolveHostname: async () => ["93.184.216.34"],
			request,
		});

		expect(request).toHaveBeenCalledWith(
			expect.objectContaining({ hostname: "github.com" }),
			"93.184.216.34",
			expect.any(AbortSignal),
		);
		expect(preview).toEqual({
			url: "https://github.com/example/project",
			title: "Open Graph title",
			description: "Preview description",
			image: "https://github.com/card.png",
			siteName: "Example Site",
			provider: "GitHub",
		});
	});

	it("revalidates and pins HTTPS redirect destinations", async () => {
		const request = vi
			.fn()
			.mockResolvedValueOnce(response("", { statusCode: 302, headers: { location: "https://target.example/post" } }))
			.mockResolvedValueOnce(response('<meta name="twitter:title" content="Redirected">'));
		const resolveHostname = vi
			.fn()
			.mockResolvedValueOnce(["93.184.216.34"])
			.mockResolvedValueOnce(["142.250.1.1"]);

		const preview = await loadLinkPreview("https://source.example", { resolveHostname, request });

		expect(request.mock.calls.map((call) => call[1])).toEqual(["93.184.216.34", "142.250.1.1"]);
		expect(preview?.url).toBe("https://target.example/post");
		expect(preview?.title).toBe("Redirected");
	});

	it("rejects redirects that resolve to private addresses", async () => {
		const request = vi.fn(async () =>
			response("", { statusCode: 302, headers: { location: "https://internal.example/secret" } }),
		);
		const resolveHostname = vi
			.fn()
			.mockResolvedValueOnce(["93.184.216.34"])
			.mockResolvedValueOnce(["127.0.0.1"]);

		await expect(loadLinkPreview("https://source.example", { resolveHostname, request })).resolves.toBeNull();
		expect(request).toHaveBeenCalledTimes(1);
	});

	it("rejects unsafe destinations before requesting them", async () => {
		const request = vi.fn();

		await expect(
			loadLinkPreview("https://internal.example", {
				resolveHostname: async () => ["10.0.0.1"],
				request,
			}),
		).resolves.toBeNull();
		await expect(loadLinkPreview("http://example.com", { request })).resolves.toBeNull();
		expect(request).not.toHaveBeenCalled();
	});

	it("falls back when responses exceed the byte limit or metadata is unavailable", async () => {
		const request = vi.fn(async () => response("x".repeat(20)));
		const dependencies = {
			resolveHostname: async () => ["93.184.216.34"],
			request,
			maxBytes: 10,
		};

		await expect(loadLinkPreview("https://example.com", dependencies)).resolves.toBeNull();
		await expect(
			loadLinkPreview("https://example.com", {
				...dependencies,
				maxBytes: 100,
				request: async () => response("<title> </title>"),
			}),
		).resolves.toBeNull();
	});

	it("aborts requests after the configured timeout", async () => {
		const request = vi.fn(
			(_url: URL, _address: string, signal: AbortSignal) =>
				new Promise<PreviewResponse>((_resolve, reject) => {
					signal.addEventListener("abort", () => reject(signal.reason), { once: true });
				}),
		);

		await expect(
			loadLinkPreview("https://example.com", {
				resolveHostname: async () => ["93.184.216.34"],
				request,
				timeoutMs: 5,
			}),
		).resolves.toBeNull();
	});

	it("applies the timeout while DNS resolution is pending", async () => {
		await expect(
			loadLinkPreview("https://example.com", {
				resolveHostname: () => new Promise<string[]>(() => undefined),
				timeoutMs: 5,
			}),
		).resolves.toBeNull();
	});
});
