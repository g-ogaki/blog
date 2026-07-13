"use client";

import { useState } from "react";
import type { ModerationAction } from "@/lib/comments/repository";

interface ModerationConfirmationProps {
	action: ModerationAction;
	token: string;
}

type SubmissionState = "idle" | "submitting" | "complete" | "unavailable" | "error";

export function ModerationConfirmation({ action, token }: ModerationConfirmationProps) {
	const [state, setState] = useState<SubmissionState>("idle");
	const actionLabel = action === "approve" ? "承認" : "拒否";

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setState("submitting");
		try {
			const response = await fetch("/api/comments/moderate", {
				body: JSON.stringify({ action, token }),
				headers: { "content-type": "application/json" },
				method: "POST",
			});
			if (response.ok) setState("complete");
			else if (response.status === 404) setState("unavailable");
			else setState("error");
		} catch {
			setState("error");
		}
	}

	if (state === "complete") return <p role="status">コメントを{actionLabel}しました。</p>;
	if (state === "unavailable") return <p role="status">この確認リンクは無効か、期限切れか、すでに使用済みです。</p>;

	return (
		<form className="moderation-form" onSubmit={submit}>
			<p>この操作はまだ実行されていません。確認後にボタンを押してください。</p>
			<button disabled={state === "submitting"} type="submit">
				{state === "submitting" ? "処理中…" : `コメントを${actionLabel}する`}
			</button>
			{state === "error" ? <p role="alert">処理できませんでした。時間をおいて再試行してください。</p> : null}
		</form>
	);
}
