interface CloudflareWebAnalyticsProps {
	token?: string;
}

export function CloudflareWebAnalytics({
	token = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN,
}: CloudflareWebAnalyticsProps) {
	const normalizedToken = token?.trim();
	if (!normalizedToken) return null;

	return (
		<script
			data-cf-beacon={JSON.stringify({ token: normalizedToken })}
			defer
			src="https://static.cloudflareinsights.com/beacon.min.js"
		/>
	);
}
