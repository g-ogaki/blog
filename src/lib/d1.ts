import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Retrieves the Cloudflare D1 database instance from the current Worker context.
 * 
 * Note: This function must be called dynamically (e.g., within Server Actions, 
 * Route Handlers, or dynamic Server Components). 
 * 
 * @returns The configured D1 database instance (DB binding).
 */
export async function getD1Database() {
    // Using `async: true` ensures the context is correctly fetched in the Next.js App Router
    // asynchronously, preventing issues with global static context during dev or build.
    const { env } = await getCloudflareContext({ async: true });

    if (!env || !env.DB) {
        throw new Error(
            "D1 database binding (env.DB) is not available in the current context. " +
            "Ensure you are running the application via OpenNext/Wrangler."
        );
    }

    return env.DB;
}
