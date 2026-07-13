const encoder = new TextEncoder();

async function sha256(value: string) {
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hashIpAddress(ipAddress: string, secret: string) {
	return sha256(`${ipAddress}${secret}`);
}

export function hashModerationToken(token: string) {
	return sha256(token);
}
