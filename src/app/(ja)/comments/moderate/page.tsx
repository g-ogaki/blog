import type { Metadata } from "next";
import { ModerationConfirmation } from "@/components/moderation-confirmation";
import type { ModerationAction } from "@/lib/comments/repository";

interface ModerationPageProps {
	searchParams: Promise<{ action?: string; token?: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
	referrer: "no-referrer",
	robots: { follow: false, index: false },
	title: "コメント確認",
};

export default async function ModerationPage({ searchParams }: ModerationPageProps) {
	const { action, token } = await searchParams;
	const validAction = action === "approve" || action === "reject";
	const validToken = typeof token === "string" && token.length >= 1 && token.length <= 256;

	return (
		<main className="site-shell moderation-page" id="main-content">
			<p className="eyebrow">Comment moderation</p>
			<h1>コメント確認</h1>
			{validAction && validToken ? (
				<ModerationConfirmation action={action as ModerationAction} token={token} />
			) : (
				<p>この確認リンクは無効か、期限切れか、すでに使用済みです。</p>
			)}
		</main>
	);
}
