"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

const terminalCopy = {
	ja: {
		label: "moniの自己紹介インタビュー",
		inputLabel: "メッセージを入力",
		javascriptRequired: "自由入力には JavaScript が必要です",
		placeholder: "質問する",
		turns: [
			{ question: "こんにちは。", answer: "こんにちは！何かお手伝いできることはありますか？" },
			{ question: "あなたについて教えて。", answer: "人間よりも AI とばかり会話しているおじさんです。好きな音楽は Janne Da Arc とショパン、好きな数学の定理はヒルベルト空間の射影定理です。" },
			{ question: "空はなぜ青いの？", answer: "レイリー散乱という現象だよって言いたいけどよく知らないので、私じゃなく ChatGPT に聞いてね。" },
		],
		freeReply: "自由回答機能を実装したいのですが、Cloudflare の有料プランが必要であり、無職なのでお金がありません助けて",
	},
	en: {
		label: "Introduction interview with moni",
		inputLabel: "Enter a message",
		javascriptRequired: "JavaScript is required for free-form questions",
		placeholder: "Ask a question",
		turns: [
			{ question: "Hello.", answer: "Hello! How can I help you?" },
			{ question: "Tell me about yourself.", answer: "I am a middle-aged man who talks to AI more than humans. My favorite music is Janne Da Arc and Chopin, and my favorite mathematical theorem is the Hilbert projection theorem." },
			{ question: "Why is the sky blue?", answer: "I would like to say it is because of Rayleigh scattering, but I do not know it well enough — please ask ChatGPT instead of me." },
		],
		freeReply: "I would like to implement free-form answers, but that needs a paid Cloudflare plan, and I am unemployed, so please help.",
	},
} as const;

interface ReplySegment {
	href?: string;
	text: string;
}

interface ConfiguredReply {
	segments: readonly ReplySegment[];
}

const STARTUP_DELAY_MS = 1000;
const FIRST_QUESTION_DELAY_MS = 420;
const INTER_TURN_DELAY_MS = 630;
const GUEST_TYPE_SPEED_MS = 42;
const SUBMIT_DELAY_MS = 500;
const PENDING_DURATION_MS = 300;
const WORKING_DURATION_MS = 600;

type TurnPhase = "waiting" | "working";

interface VisibleTurn {
	answer: string;
	assistiveHidden?: boolean;
	phase?: TurnPhase;
	question: string;
	reply?: ConfiguredReply;
}

function getReplyText(reply: ConfiguredReply) {
	return reply.segments.map((segment) => segment.text).join("");
}

function pickFreeReply(replies: readonly [ConfiguredReply, ...ConfiguredReply[]]) {
	return replies[Math.floor(Math.random() * replies.length)];
}

function ReplyText({ reply, text }: { reply: ConfiguredReply; text: string }) {
	let remaining = Array.from(text).length;
	return reply.segments.map((segment, index) => {
		const characters = Array.from(segment.text);
		const visible = characters.slice(0, remaining).join("");
		remaining = Math.max(0, remaining - characters.length);
		if (!visible) return null;
		return segment.href ? <a className="text-terminal-accent underline decoration-1 underline-offset-4 hover:text-terminal-text" href={segment.href} key={index} rel="noopener noreferrer" target="_blank">{visible}</a> : <span key={index}>{visible}</span>;
	});
}

function TerminalCat() {
	return (
		<svg viewBox="0 0 64 64">
			<path className="terminal-cat__body" d="M22 48C14 55 7 52 5 44c-2-8 1-17 5-21 2-2 5-2 7 0s1 5-1 7c-4 4-5 10-2 14 2 2 4 1 6-1Z" />
			<path className="terminal-cat__body" d="M27 35c-6 3-9 10-8 18 .5 5 4 8 9 8h19c5 0 8-2 8-6 0-3-2-5-6-5 1-7-1-13-7-16Z" />
			<path className="terminal-cat__body" d="m19 15-1-9 10 5c4-2 9-2 13 0l9-5-1 10c4 3 6 7 5 12-1 8-9 12-19 12S17 36 16 28c-1-5 0-10 3-13Z" />
			<path className="terminal-cat__detail" d="M27 23v1m16-1v1m-11 5c2 2 4 2 6 0m-3-2v3m-14-4-8-2m8 6-8 2m36-6 8-2m-8 6 8 2M30 41c-1 7-1 13 1 17m11-17c0 7 1 13 3 17m-20-1c2 2 5 2 7 0m11 0c3 2 6 2 8 0" />
		</svg>
	);
}

function Banner({ popping = false }: { popping?: boolean }) {
	return (
		<div className={`terminal-banner grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-4 border-b border-terminal-border pb-6 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-6${popping ? " is-popping" : ""}`}>
			<div aria-hidden="true" className="terminal-cat grid size-16 place-items-center sm:size-20 [&_svg]:size-15 [&_svg]:overflow-visible sm:[&_svg]:size-18"><TerminalCat /></div>
			<div className="terminal-banner-copy grid gap-1 font-mono"><strong className="text-base font-semibold text-terminal-text">moni code v1.0.0</strong><span className="text-sm text-terminal-text-muted">monipy.org</span></div>
		</div>
	);
}

function Transcript({ turns }: { turns: readonly VisibleTurn[] }) {
	return (
		<ol className="terminal-transcript mt-6 grid list-none gap-3 p-0">
			{turns.map((turn, index) => (
				<li aria-hidden={turn.assistiveHidden || undefined} className="terminal-turn grid gap-3" key={`${index}-${turn.question}`}>
					<div className="terminal-submission flex items-start gap-3 font-mono"><span aria-hidden="true" className="terminal-prompt grid h-7 w-4 flex-none place-items-center font-mono font-semibold text-terminal-accent">&gt;</span><p className="terminal-question m-0 leading-7 [overflow-wrap:anywhere]">{turn.question}</p></div>
					{turn.phase === "waiting" ? null : <div className="terminal-output grid grid-cols-[auto_minmax(0,1fr)] gap-3"><span aria-hidden="true" className="terminal-output-marker grid h-7 w-4 place-items-center self-start font-mono font-semibold text-terminal-accent"><span className={`block size-4 text-center leading-4${turn.phase === "working" ? " animate-spin" : ""}`}>{turn.phase === "working" ? "◒" : "●"}</span></span><span className="terminal-output-copy min-w-0 font-sans leading-7">{turn.phase === "working" ? <span aria-hidden="true" className="terminal-working font-mono text-sm leading-7 text-terminal-text-muted">Working…</span> : <span className="terminal-stream">{turn.reply ? <ReplyText reply={turn.reply} text={turn.answer} /> : turn.answer}</span>}</span></div>}
				</li>
			))}
		</ol>
	);
}

function sleep(duration: number, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		const timeout = window.setTimeout(resolve, duration);
		signal.addEventListener("abort", () => {
			window.clearTimeout(timeout);
			reject(signal.reason);
		}, { once: true });
	});
}

async function typeText(value: string, speed: number, signal: AbortSignal, update: (text: string) => void) {
	let visible = "";
	for (const character of value) {
		await sleep(speed, signal);
		visible += character;
		update(visible);
	}
}

export function HomeTerminal({ locale = "ja" }: { locale?: Locale }) {
	const copy = terminalCopy[locale];
	const preparedTurns = copy.turns;
	const freeReplies: readonly [ConfiguredReply, ...ConfiguredReply[]] = [{ segments: [{ text: copy.freeReply }] }];
	const [animated, setAnimated] = useState(false);
	const [bannerVisible, setBannerVisible] = useState(true);
	const [busy, setBusy] = useState(true);
	const [hydrated, setHydrated] = useState(false);
	const [input, setInput] = useState("");
	const [launchCommand, setLaunchCommand] = useState("moni");
	const [status, setStatus] = useState("");
	const [title, setTitle] = useState("about — moni");
	const [visibleTurns, setVisibleTurns] = useState<VisibleTurn[]>([]);
	const stageRef = useRef<HTMLDivElement>(null);
	const reducedMotionRef = useRef(false);

	useEffect(() => {
		const controller = new AbortController();
		const play = async () => {
			setAnimated(true);
			setBannerVisible(false);
			setLaunchCommand("");
			setTitle("about — zsh");
			try {
				await sleep(STARTUP_DELAY_MS, controller.signal);
				await typeText("moni", 80, controller.signal, setLaunchCommand);
				await sleep(180, controller.signal);
				setTitle("about — moni");
				setBannerVisible(true);
				await sleep(FIRST_QUESTION_DELAY_MS, controller.signal);
				for (const [index, turn] of preparedTurns.entries()) {
					await typeText(turn.question, GUEST_TYPE_SPEED_MS, controller.signal, setInput);
					await sleep(SUBMIT_DELAY_MS, controller.signal);
					setVisibleTurns((current) => [...current, { question: turn.question, answer: "", assistiveHidden: true, phase: "waiting" }]);
					setInput("");
					await sleep(PENDING_DURATION_MS, controller.signal);
					setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, phase: "working" } : item));
					await sleep(WORKING_DURATION_MS, controller.signal);
					setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, phase: undefined } : item));
					await typeText(turn.answer, 22, controller.signal, (answer) => {
						setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, answer } : item));
					});
					await sleep(INTER_TURN_DELAY_MS, controller.signal);
				}
				setBusy(false);
			} catch {
				// Unmounting cancels playback without leaving timers behind.
			}
		};
		const start = window.setTimeout(() => {
			setHydrated(true);
			reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			if (reducedMotionRef.current) setBusy(false);
			else void play();
		}, 0);
		return () => {
			window.clearTimeout(start);
			controller.abort();
		};
	}, [preparedTurns]);

	useEffect(() => {
		if (animated && typeof stageRef.current?.scrollTo === "function") stageRef.current.scrollTo({ top: stageRef.current.scrollHeight });
	}, [animated, bannerVisible, launchCommand, visibleTurns]);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const question = input.trim();
		if (!question || busy) return;
		const reply = pickFreeReply(freeReplies);
		const replyText = getReplyText(reply);
		setInput("");
		setBusy(true);
		if (reducedMotionRef.current) {
			setVisibleTurns((current) => [...current, { question, answer: replyText, reply }]);
			setBusy(false);
			setStatus(replyText);
			return;
		}
		setAnimated(true);
		const index = visibleTurns.length;
		setVisibleTurns((current) => [...current, { question, answer: "", phase: "waiting", reply }]);
		const controller = new AbortController();
		await sleep(PENDING_DURATION_MS, controller.signal);
		setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, phase: "working" } : item));
		await sleep(WORKING_DURATION_MS, controller.signal);
		setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, phase: undefined } : item));
		await typeText(replyText, 22, controller.signal, (answer) => {
			setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, answer } : item));
		});
		setBusy(false);
		setStatus(replyText);
	}

	const staticTurns = preparedTurns.map((turn) => ({ ...turn }));
	return (
		<div aria-label={copy.label} className="chat-window flex h-128 w-full min-w-0 flex-col overflow-hidden rounded-lg border border-terminal-border bg-terminal-surface text-terminal-text [color-scheme:dark]">
			<div className="window-titlebar grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3 border-b border-terminal-border bg-terminal-chrome px-4 py-3.5 font-mono text-xs font-medium text-terminal-text-muted sm:px-5">
				<span aria-hidden="true" className="window-controls flex gap-1.5"><span className="window-control size-3 rounded-full border border-black/15 bg-[#ff5f57]" /><span className="window-control size-3 rounded-full border border-black/15 bg-[#febc2e]" /><span className="window-control size-3 rounded-full border border-black/15 bg-[#28c840]" /></span>
				<span className="window-title flex min-w-0 items-center justify-center gap-2"><svg aria-hidden="true" className="size-4 flex-none stroke-current stroke-[1.75]" fill="none" viewBox="0 0 24 24"><path d="M3 6.5h7l2 2h9v9.5H3z" /></svg><span className="window-title-text overflow-hidden text-ellipsis whitespace-nowrap">{title}</span></span>
				<span aria-hidden="true" />
			</div>
			<div className="chat-stage min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-color:var(--terminal-border)_var(--terminal-surface)] [scrollbar-gutter:stable] sm:p-6" ref={stageRef}>
				<div className={`terminal-launch mb-6 flex flex-wrap gap-2 font-mono text-terminal-text${animated && launchCommand !== "moni" ? " is-typing" : ""}`}><span>guest@notebook:~/about$</span><span className="terminal-command inline-flex items-center"><code className="font-mono font-semibold">{launchCommand}</code>{animated && launchCommand !== "moni" ? <span aria-hidden="true" className="terminal-cursor" /> : null}</span></div>
				{bannerVisible ? <Banner popping={animated} /> : null}
				<div className={animated ? "sr-only" : "static-transcript"}><Transcript turns={staticTurns} /></div>
				{!animated && visibleTurns.length ? <div className="animated-transcript"><Transcript turns={visibleTurns} /></div> : null}
				{animated ? <div className="animated-transcript"><Transcript turns={visibleTurns} /></div> : null}
			</div>
			<form className="terminal-input flex min-h-13 items-center gap-3 border-t border-terminal-border px-4 py-3.5 font-mono text-terminal-accent focus-within:-outline-offset-2 focus-within:outline-2 focus-within:outline-terminal-accent sm:px-6" onSubmit={submit}>
				<label className="sr-only" htmlFor="terminal-free-input">{copy.inputLabel}</label>
				<span aria-hidden="true" className="terminal-prompt grid h-7 w-4 flex-none place-items-center font-mono font-semibold text-terminal-accent">&gt;</span>
				<input autoComplete="off" className="terminal-input-field min-w-0 flex-1 border-0 bg-transparent p-0 font-[inherit] text-terminal-text opacity-100 outline-0 placeholder:text-terminal-text-muted disabled:cursor-default" disabled={busy} id="terminal-free-input" maxLength={200} onChange={(event) => setInput(event.target.value)} placeholder={!hydrated ? copy.javascriptRequired : busy ? undefined : copy.placeholder} type="text" value={input} />
			</form>
			<p aria-live="polite" className="sr-only" role="status">{status}</p>
		</div>
	);
}
