"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { PublicComment } from "@/lib/comments/repository";
import { formatSiteDate } from "@/lib/format-date";
import { getDictionary, type Locale } from "@/lib/i18n";

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
	locale?: Locale;
	postSlug: string;
	siteKey: string;
	turnstileApi?: TurnstileApi;
}

type CommentsState = "loading" | "ready" | "error";
type SubmissionState = "idle" | "submitting" | "success" | "error";

function submissionError(status: number, locale: Locale) {
	const copy = getDictionary(locale).comments;
	if (status === 400) return copy.invalid;
	if (status === 403) return copy.forbidden;
	if (status === 429) return copy.rateLimited;
	return copy.failure;
}

export function CommentSection({ locale = "ja", postSlug, siteKey, turnstileApi }: CommentSectionProps) {
	const copy = getDictionary(locale).comments;
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
				const response = await fetch(`/api/comments?post=${encodeURIComponent(postSlug)}&locale=${locale}`, {
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
	}, [locale, postSlug]);

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
				body: JSON.stringify({ comment, locale, name, post_slug: postSlug, turnstile_token: turnstileToken }),
				headers: { "content-type": "application/json" },
				method: "POST",
			});
			if (!response.ok) {
				setSubmissionMessage(submissionError(response.status, locale));
				setSubmissionState("error");
				return;
			}
			setComment("");
			setName("");
			setSubmissionMessage(copy.success);
			setSubmissionState("success");
		} catch {
			setSubmissionMessage(submissionError(500, locale));
			setSubmissionState("error");
		} finally {
			resetTurnstile();
		}
	}

	return (
		<section className="comment-section mx-auto mt-16 w-full max-w-3xl" aria-labelledby="comments-heading">
			{turnstileApi ? null : (
				<Script
					onError={() => setTurnstileError(true)}
					onReady={() => setScriptReady(true)}
					src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
					strategy="afterInteractive"
				/>
			)}
			<header className="comment-heading flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-baseline sm:gap-4">
				<h2 className="text-2xl leading-8 font-semibold" id="comments-heading">{copy.heading}</h2>
				{commentsState === "ready" ? <p className="m-0 text-sm text-text-muted">{copy.count(comments.length)}</p> : null}
			</header>

			{commentsState !== "ready" ? (
				<div aria-live="polite" className="comment-list-status mt-8 border-t border-site-border text-sm text-text-muted">
					<p className="m-0 py-6">{commentsState === "loading" ? copy.loading : copy.loadError}</p>
				</div>
			) : null}
			{commentsState === "ready" && comments.length === 0 ? (
				<ol className="comment-list mt-8 list-none border-t border-site-border p-0">
					<li className="py-6"><p className="m-0 text-text-muted">{copy.empty}</p></li>
				</ol>
			) : null}
			{comments.length > 0 ? (
				<ol className="comment-list mt-8 list-none border-t border-site-border p-0">
					{comments.map((item) => (
						<li className="py-6 [&+&]:mt-2" key={item.id}>
							<header className="flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-baseline sm:gap-4"><strong>{item.name}</strong><time className="text-xs text-text-muted" dateTime={item.created_at}>{formatSiteDate(item.created_at, locale)}</time></header>
							<p className="comment-body mt-4 whitespace-pre-wrap break-words">{item.comment}</p>
						</li>
					))}
				</ol>
			) : null}

			<form className="comment-form mt-8 grid gap-4 rounded-md border border-site-border bg-surface-raised p-4 sm:p-6" onSubmit={submitComment}>
				<div className="comment-form-heading flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-baseline sm:gap-4">
					<h3 className="text-2xl leading-8 font-semibold">{copy.write}</h3>
					<p className="m-0 text-sm text-text-muted">{copy.moderation}</p>
				</div>
				<label className="grid gap-2 text-sm font-semibold">
					<span>{copy.name}</span>
					<input autoComplete="name" className="min-h-11 w-full rounded-md border border-control-border bg-surface p-3 text-site-text placeholder:text-text-muted" maxLength={80} onChange={(event) => setName(event.target.value)} required value={name} />
				</label>
				<label className="grid gap-2 text-sm font-semibold">
					<span>{copy.comment}</span>
					<textarea aria-label={copy.comment} className="min-h-36 w-full resize-y rounded-md border border-control-border bg-surface p-3 text-site-text placeholder:text-text-muted" maxLength={2_000} onChange={(event) => setComment(event.target.value)} required rows={7} value={comment} />
					<small className="justify-self-end text-xs font-normal text-text-muted">{comment.length} / 2000</small>
				</label>
				<div ref={turnstileContainer} />
				{!siteKey ? <p role="alert">{copy.verificationMissing}</p> : null}
				{turnstileError ? <p role="alert">{copy.verificationError}</p> : null}
				<button className="min-h-11 w-fit cursor-pointer rounded-md border-0 bg-action px-4 text-sm font-semibold text-on-action hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-150" disabled={!turnstileToken || submissionState === "submitting"} type="submit">
					{submissionState === "submitting" ? copy.sending : copy.send}
				</button>
				{submissionMessage ? (
					<p className={`comment-feedback m-0 ${submissionState}`} role={submissionState === "error" ? "alert" : "status"}>
						{submissionMessage}
					</p>
				) : null}
			</form>
		</section>
	);
}
