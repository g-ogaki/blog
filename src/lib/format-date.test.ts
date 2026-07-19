import { describe, expect, it } from "vitest";
import { formatPostDate, formatSiteDate } from "./format-date";

describe("site date formatting", () => {
	it("formats post dates with the documented numeric presentation", () => {
		expect(formatPostDate("2026-05-03")).toBe("2026.05.03");
	});

	it("formats English dates in English", () => {
		expect(formatPostDate("2026-05-03", "en")).toBe("May 3, 2026");
	});

	it("interprets timestamps in Asia/Tokyo before formatting", () => {
		expect(formatSiteDate("2026-07-14T15:30:00.000Z")).toBe("2026.07.15");
		expect(formatSiteDate("2026-07-14T15:30:00.000Z", "en")).toBe("July 15, 2026");
	});
});
