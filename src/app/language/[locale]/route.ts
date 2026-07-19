import { NextResponse } from "next/server";
import { homePath, isLocale } from "@/lib/i18n";
import { isSafeLanguageRedirect, localePreferenceCookie } from "@/lib/locale-routing";

interface LanguageRouteProps {
	params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: LanguageRouteProps) {
	const { locale } = await params;
	if (!isLocale(locale)) return new Response("Not found", { status: 404 });
	const requestUrl = new URL(request.url);
	const requestedRedirect = requestUrl.searchParams.get("redirect") ?? "";
	const redirectPath = isSafeLanguageRedirect(requestedRedirect)
		? requestedRedirect
		: homePath(locale);
	const response = NextResponse.redirect(new URL(redirectPath, requestUrl), 303);
	response.headers.set("cache-control", "private, no-store");
	response.headers.set("set-cookie", localePreferenceCookie(locale));
	return response;
}
