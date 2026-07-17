"use client";

import { useEffect, useRef, useState } from "react";

const preparedTurns = [
	{ question: "自己紹介してください。", answer: "moniです。ソフトウェアエンジニアとして働きながら、興味を持ったことを学んでいます。" },
	{ question: "どんなことに興味がありますか？", answer: "プログラミング、数学、投資、そして日々の暮らしに関心があります。" },
	{ question: "普段はどのように学んでいますか？", answer: "気になったことを小さく試し、わからなかったことも含めて記録しながら学んでいます。" },
] as const;

const freeReply = "自由記述に対する返答はできないのです。あと誰か猫のアイコン描いて";

interface VisibleTurn {
	answer: string;
	question: string;
}

function TerminalCat() {
	return (
		<svg viewBox="0 0 64 64">
			<path className="terminal-cat-body" d="M22 48C14 55 7 52 5 44c-2-8 1-17 5-21 2-2 5-2 7 0s1 5-1 7c-4 4-5 10-2 14 2 2 4 1 6-1Z" />
			<path className="terminal-cat-body" d="M27 35c-6 3-9 10-8 18 .5 5 4 8 9 8h19c5 0 8-2 8-6 0-3-2-5-6-5 1-7-1-13-7-16Z" />
			<path className="terminal-cat-body" d="m19 15-1-9 10 5c4-2 9-2 13 0l9-5-1 10c4 3 6 7 5 12-1 8-9 12-19 12S17 36 16 28c-1-5 0-10 3-13Z" />
			<path className="terminal-cat-detail" d="M27 23v1m16-1v1m-11 5c2 2 4 2 6 0m-3-2v3m-14-4-8-2m8 6-8 2m36-6 8-2m-8 6 8 2M30 41c-1 7-1 13 1 17m11-17c0 7 1 13 3 17m-20-1c2 2 5 2 7 0m11 0c3 2 6 2 8 0" />
		</svg>
	);
}

function Banner() {
	return (
		<div className="terminal-banner">
			<div aria-hidden="true" className="terminal-cat"><TerminalCat /></div>
			<div className="terminal-banner-copy"><strong>moni code v1.0.0</strong><span>monipy.org</span></div>
		</div>
	);
}

function Transcript({ turns }: { turns: readonly VisibleTurn[] }) {
	return (
		<ol className="terminal-transcript">
			{turns.map((turn, index) => (
				<li className="terminal-turn" key={`${index}-${turn.question}`}>
					<div className="terminal-submission"><span aria-hidden="true" className="terminal-prompt">&gt;</span><p>{turn.question}</p></div>
					<div className="terminal-output"><span aria-hidden="true" className="terminal-output-marker">●</span><p>{turn.answer}</p></div>
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

export function HomeTerminal() {
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
				await typeText("moni", 80, controller.signal, setLaunchCommand);
				await sleep(180, controller.signal);
				setTitle("about — moni");
				setBannerVisible(true);
				for (const [index, turn] of preparedTurns.entries()) {
					setVisibleTurns((current) => [...current, { question: "", answer: "" }]);
					await typeText(turn.question, 38, controller.signal, (question) => {
						setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, question } : item));
					});
					await sleep(160, controller.signal);
					await typeText(turn.answer, 22, controller.signal, (answer) => {
						setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, answer } : item));
					});
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
	}, []);

	useEffect(() => {
		if (animated && typeof stageRef.current?.scrollTo === "function") stageRef.current.scrollTo({ top: stageRef.current.scrollHeight });
	}, [animated, bannerVisible, launchCommand, visibleTurns]);

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const question = input.trim();
		if (!question || busy) return;
		setInput("");
		setBusy(true);
		if (reducedMotionRef.current) {
			setVisibleTurns((current) => [...current, { question, answer: freeReply }]);
			setBusy(false);
			setStatus(freeReply);
			return;
		}
		setAnimated(true);
		const index = visibleTurns.length;
		setVisibleTurns((current) => [...current, { question, answer: "" }]);
		const controller = new AbortController();
		await typeText(freeReply, 22, controller.signal, (answer) => {
			setVisibleTurns((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, answer } : item));
		});
		setBusy(false);
		setStatus(freeReply);
	}

	const staticTurns = preparedTurns.map((turn) => ({ ...turn }));
	return (
		<div aria-label="moniの自己紹介インタビュー" className="terminal-window">
			<div className="terminal-titlebar">
				<span aria-hidden="true" className="window-controls"><span /><span /><span /></span>
				<span className="window-title"><svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M3 6.5h7l2 2h9v9.5H3z" /></svg>{title}</span>
				<span aria-hidden="true" />
			</div>
			<div className="terminal-stage" ref={stageRef}>
				<div className="terminal-launch"><span>guest@notebook:~/about$</span><code>{launchCommand}</code>{animated && launchCommand !== "moni" ? <span aria-hidden="true" className="terminal-cursor" /> : null}</div>
				{bannerVisible ? <Banner /> : null}
				<div className={animated ? "sr-only" : "terminal-static"}><Transcript turns={staticTurns} /></div>
				{!animated && visibleTurns.length ? <Transcript turns={visibleTurns} /> : null}
				{animated ? <div aria-hidden="true"><Transcript turns={visibleTurns} /></div> : null}
			</div>
			<form className="terminal-input" onSubmit={submit}>
				<label className="sr-only" htmlFor="terminal-free-input">メッセージを入力</label>
				<span aria-hidden="true" className="terminal-prompt">&gt;</span>
				<input autoComplete="off" disabled={busy} id="terminal-free-input" maxLength={200} onChange={(event) => setInput(event.target.value)} placeholder={!hydrated ? "自由入力には JavaScript が必要です" : busy ? "自己紹介を再生しています" : "メッセージを入力して Enter"} type="text" value={input} />
			</form>
			<p aria-live="polite" className="sr-only" role="status">{status}</p>
		</div>
	);
}
