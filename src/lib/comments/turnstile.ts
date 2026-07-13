const siteverifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface VerifyTurnstileInput {
	fetcher?: typeof fetch;
	ipAddress: string;
	secretKey: string;
	token: string;
}

export class TurnstileUnavailableError extends Error {
	constructor() {
		super("Turnstile verification is unavailable");
		this.name = "TurnstileUnavailableError";
	}
}

export async function verifyTurnstile({
	fetcher = fetch,
	ipAddress,
	secretKey,
	token,
}: VerifyTurnstileInput) {
	let response: Response;
	try {
		response = await fetcher(siteverifyUrl, {
			body: JSON.stringify({ remoteip: ipAddress, response: token, secret: secretKey }),
			headers: { "content-type": "application/json" },
			method: "POST",
			signal: AbortSignal.timeout(5_000),
		});
	} catch {
		throw new TurnstileUnavailableError();
	}

	if (!response.ok) throw new TurnstileUnavailableError();

	let result: unknown;
	try {
		result = await response.json();
	} catch {
		throw new TurnstileUnavailableError();
	}

	if (!result || typeof result !== "object" || typeof (result as { success?: unknown }).success !== "boolean") {
		throw new TurnstileUnavailableError();
	}

	return (result as { success: boolean }).success;
}
