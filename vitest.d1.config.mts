import path from "node:path";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		cloudflareTest(async () => ({
			miniflare: {
				bindings: {
					TEST_MIGRATIONS: await readD1Migrations(path.resolve("migrations")),
				},
				compatibilityDate: "2026-07-12",
				d1Databases: { DB: "test-db" },
			},
		})),
	],
	test: {
		include: ["test/d1/**/*.test.ts"],
		setupFiles: ["./test/d1/setup.ts"],
	},
});
