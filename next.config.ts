import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default async function nextConfig(phase: string): Promise<NextConfig> {
	if (phase === PHASE_DEVELOPMENT_SERVER) {
		// AI Search is remote-only, while bindings without `remote: true` stay local.
		// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
		await initOpenNextCloudflareForDev({ remoteBindings: true });
	}

	return {};
}
