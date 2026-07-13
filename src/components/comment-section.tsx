"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { PublicComment } from "@/lib/comments/repository";

interface TurnstileRenderOptions {
	callback: (token: string) => void;
	"error-callback": () => boolean;
	"expired-callback": () => void;
	sitekey: string;
	theme: "auto";
}

interface TurnstileApi {
	remove: (widgetId: string) => void;
	render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
	reset: (widgetId: string) => void;
}

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

interface CommentSectionProps {
	postSlug: string;
	siteKey: string;
	turnstileApi?: TurnstileApi;
}

type CommentsState = "loading" | "ready" | "error";
type SubmissionState = "idle" | "submitting" | "success" | "error";

function formatCommentDate(value: string) {
	return new Intl.DateTimeFormat("ja-JP", {
		dateStyle: "medium",
		timeZone: "Asia/Tokyo",
	}).format(new Date(value));
}

function submissionError(status: number) {
	if (status === 400) return "入力内容を確認してください。";
	if (status === 403) return "認証を確認できませんでした。もう一度お試しください。";
	if (status === 429) return "本日の投稿上限に達しました。時間をおいてお試しください。";
	return "コメントを送信できませんでした。時間をおいてお試しください。";
}

export function CommentSection({ postSlug, siteKey, turnstileApi }: CommentSectionProps) {
	const [comments, setComments] = useState<PublicComment[]>([]);
	const [commentsState, setCommentsState] = useState<CommentsState>("loading");
	const [comment, setComment] = useState("");
	const [name, setName] = useState("");
	const [scriptReady, setScriptReady] = useState(Boolean(turnstileApi));
	const [submissionMessage, setSubmissionMessage] = useState("");
	const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
	const [turnstileError, setTurnstileError] = useState(false);
	const [turnstileToken, setTurnstileToken] = useState("");
	const turnstileContainer = useRef<HTMLDivElement>(null);
	const widgetId = useRef<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		async function loadComments() {
			try {
				const response = await fetch(`/api/comments?post=${encodeURIComponent(postSlug)}`, {
					signal: controller.signal,
				});
				if (!response.ok) throw new Error("Comment request failed");
				const result = await response.json() as { comments?: unknown };
				if (!Array.isArray(result.comments)) throw new Error("Invalid comment response");
				setComments(result.comments as PublicComment[]);
				setCommentsState("ready");
			} catch (error) {
				if ((error as { name?: string }).name !== "AbortError") setCommentsState("error");
			}
		}
		void loadComments();
		return () => controller.abort();
	}, [postSlug]);

	useEffect(() => {
		const api = turnstileApi ?? window.turnstile;
		const container = turnstileContainer.current;
		if (!scriptReady || !api || !container || !siteKey) return;

		try {
			widgetId.current = api.render(container, {
				callback: (token) => {
					setTurnstileError(false);
					setTurnstileToken(token);
				},
				"error-callback": () => {
					setTurnstileError(true);
					setTurnstileToken("");
					return true;
				},
				"expired-callback": () => setTurnstileToken(""),
				sitekey: siteKey,
				theme: "auto",
			});
		} catch {
			queueMicrotask(() => setTurnstileError(true));
		}

		return () => {
			if (widgetId.current) api.remove(widgetId.current);
			widgetId.current = null;
		};
	}, [scriptReady, siteKey, turnstileApi]);

	function resetTurnstile() {
		const api = turnstileApi ?? window.turnstile;
		if (api && widgetId.current) api.reset(widgetId.current);
		setTurnstileToken("");
	}

	async function submitComment(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!turnstileToken) return;
		setSubmissionMessage("");
		setSubmissionState("submitting");
		try {
			const response = await fetch("/api/comments", {
				body: JSON.stringify({ comment, name, post_slug: postSlug, turnstile_token: turnstileToken }),
				headers: { "content-type": "application/json" },
				method: "POST",
			});
			if (!response.ok) {
				setSubmissionMessage(submissionError(response.status));
				setSubmissionState("error");
				return;
			}
			setComment("");
			setName("");
			setSubmissionMessage("コメントを受け付けました。承認後に表示されます。");
			setSubmissionState("success");
		} catch {
			setSubmissionMessage(submissionError(500));
			setSubmissionState("error");
		} finally {
			resetTurnstile();
		}
	}

	return (
		<section className="comment-section" aria-labelledby="comments-heading">
			{turnstileApi ? null : (
				<Script
					onError={() => setTurnstileError(true)}
					onReady={() => setScriptReady(true)}
					src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
					strategy="afterInteractive"
				/>
			)}
			<header className="comment-heading">
				<p className="eyebrow">Discussion</p>
				<h2 id="comments-heading">コメント</h2>
			</header>

			<div aria-live="polite" className="comment-list-status">
				{commentsState === "loading" ? <p>コメントを読み込んでいます。</p> : null}
				{commentsState === "error" ? <p>コメントを読み込めませんでした。</p> : null}
				{commentsState === "ready" && comments.length === 0 ? <p>まだコメントはありません。</p> : null}
				{commentsState === "ready" && comments.length > 0 ? <p>{comments.length}件のコメント</p> : null}
			</div>
			{comments.length > 0 ? (
				<ol className="comment-list">
					{comments.map((item) => (
						<li key={item.id}>
							<header><strong>{item.name}</strong><time dateTime={item.created_at}>{formatCommentDate(item.created_at)}</time></header>
							<p className="comment-body">{item.comment}</p>
						</li>
					))}
				</ol>
			) : null}

			<form className="comment-form" onSubmit={submitComment}>
				<div className="comment-form-heading">
					<h3>コメントを書く</h3>
					<p>投稿は確認後に公開されます。</p>
				</div>
				<label>
					<span>名前</span>
					<input autoComplete="name" maxLength={80} onChange={(event) => setName(event.target.value)} required value={name} />
				</label>
				<label>
					<span>コメント</span>
					<textarea aria-label="コメント" maxLength={2_000} onChange={(event) => setComment(event.target.value)} required rows={7} value={comment} />
					<small>{comment.length} / 2000</small>
				</label>
				<div ref={turnstileContainer} />
				{!siteKey ? <p role="alert">コメント認証が設定されていません。</p> : null}
				{turnstileError ? <p role="alert">コメント認証を読み込めませんでした。再試行してください。</p> : null}
				<button disabled={!turnstileToken || submissionState === "submitting"} type="submit">
					{submissionState === "submitting" ? "送信中…" : "確認へ送信"}
				</button>
				{submissionMessage ? (
					<p className={`comment-feedback ${submissionState}`} role={submissionState === "error" ? "alert" : "status"}>
						{submissionMessage}
					</p>
				) : null}
			</form>
		</section>
	);
}
