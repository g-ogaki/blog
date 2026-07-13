import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CloudflareWebAnalytics } from "./cloudflare-web-analytics";

afterEach(cleanup);

describe("CloudflareWebAnalytics", () => {
	it("renders nothing when the token is missing", () => {
		const { container } = render(<CloudflareWebAnalytics token="" />);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders the Cloudflare beacon for a configured token", () => {
		const { container } = render(<CloudflareWebAnalytics token="site-token" />);
		const script = container.querySelector("script");

		expect(script).toHaveAttribute("src", "https://static.cloudflareinsights.com/beacon.min.js");
		expect(script).toHaveAttribute("data-cf-beacon", JSON.stringify({ token: "site-token" }));
	});
});
