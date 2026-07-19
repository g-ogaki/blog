import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RootLayout from "./layout";

const captured = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));

vi.mock("./globals.css", () => ({}));

vi.mock("next/script", () => ({
	default: (props: Record<string, unknown>) => {
		captured.props = props;
		return null;
	},
}));

beforeEach(() => {
	captured.props = null;
});

describe("RootLayout", () => {
	it("loads the pre-paint theme initializer through next/script", () => {
		renderToStaticMarkup(<RootLayout><main>Content</main></RootLayout>);

		expect(captured.props).toMatchObject({
			id: "theme-initializer",
			strategy: "beforeInteractive",
		});
		expect(captured.props?.children).toContain("localStorage.getItem('theme')");
		expect(captured.props?.children).toContain("classList.add('js')");
	});
});
