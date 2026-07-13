import { describe, expect, it } from "vitest";
import { GET, dynamic } from "./route";

describe("GET /rss.xml", () => {
	it("returns a statically generated RSS document with published posts", async () => {
		const response = GET();
		const body = await response.text();

		expect(dynamic).toBe("force-static");
		expect(response.headers.get("content-type")).toBe("application/rss+xml; charset=utf-8");
		expect(body).toContain("https://monipy.org/blog/2026/20260503-learning-typescript");
		expect(body).not.toContain("Rust学習メモ");
	});
});
