import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ModerationPage from "@/app/(ja)/comments/moderate/page";

describe("moderation confirmation page", () => {
	it("renders a confirmation without making a moderation request on GET", async () => {
		const fetchSpy = vi.spyOn(globalThis, "fetch");
		render(await ModerationPage({ searchParams: Promise.resolve({ action: "approve", token: "opaque-token" }) }));

		expect(screen.getByRole("button", { name: "コメントを承認する" })).toBeInTheDocument();
		expect(screen.getByText(/まだ実行されていません/)).toBeInTheDocument();
		expect(fetchSpy).not.toHaveBeenCalled();
		fetchSpy.mockRestore();
	});
});
