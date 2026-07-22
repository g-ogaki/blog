import { readdirSync, watch, type FSWatcher } from "node:fs";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import {
	applyAuthoringBatch,
	createAuthoringBatcher,
	preparationForChanges,
	type AuthoringPreparation,
} from "./lib/authoring-changes";

const projectDirectory = process.cwd();
const contentDirectory = path.join(projectDirectory, "content", "posts");
const nextBinary = path.join(projectDirectory, "node_modules", "next", "dist", "bin", "next");
const debounceMilliseconds = 200;
let nextProcess: ChildProcess | undefined;
let restarting = false;
let shuttingDown = false;
let contentWatcher: FSWatcher | undefined;

function runNodeScript(relativePath: string, args: readonly string[] = []) {
	return new Promise<void>((resolve, reject) => {
		const child = spawn(process.execPath, ["--import", "tsx", path.join(projectDirectory, relativePath), ...args], {
			cwd: projectDirectory,
			stdio: "inherit",
		});
		child.once("error", reject);
		child.once("exit", (code, signal) => {
			if (code === 0) resolve();
			else reject(new Error(`${relativePath} exited with ${signal ? `signal ${signal}` : `status ${code ?? "unknown"}`}`));
		});
	});
}

async function prepareContent({ generateMetadata, publishAssets }: AuthoringPreparation) {
	if (publishAssets) await runNodeScript("scripts/publish-post-assets.ts", ["--include-drafts"]);
	if (generateMetadata) await runNodeScript("scripts/generate-static-metadata.ts");
}

function collectContentFiles(directory = contentDirectory, prefix = "", files = new Set<string>()) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const relativePath = path.join(prefix, entry.name);
		if (entry.isDirectory()) collectContentFiles(path.join(directory, entry.name), relativePath, files);
		else if (entry.isFile()) files.add(relativePath.split(path.sep).join("/"));
	}
	return files;
}

function startNext() {
	const child = spawn(process.execPath, [nextBinary, "dev"], {
		cwd: projectDirectory,
		env: process.env,
		stdio: "inherit",
	});
	nextProcess = child;
	child.once("error", (error) => {
		console.error("[authoring] Next.js failed to start.", error);
	});
	child.once("exit", (code, signal) => {
		if (child !== nextProcess) return;
		nextProcess = undefined;
		if (!restarting && !shuttingDown) {
			console.error(`[authoring] Next.js stopped unexpectedly (${signal ?? code ?? "unknown"}).`);
			contentWatcher?.close();
			process.exitCode = code ?? 1;
		}
	});
}

function stopNext() {
	const child = nextProcess;
	if (!child || child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
	return new Promise<void>((resolve) => {
		child.once("exit", () => resolve());
		child.kill("SIGTERM");
	});
}

async function restartNext() {
	restarting = true;
	console.log("[authoring] Structural content change prepared; restarting Next.js.");
	await stopNext();
	startNext();
	restarting = false;
}

async function main() {
	console.log("[authoring] Preparing draft and published content.");
	await prepareContent({ generateMetadata: true, publishAssets: true, restartNext: false });
	let knownFiles = collectContentFiles();
	startNext();

	const batcher = createAuthoringBatcher({
		delayMs: debounceMilliseconds,
		onBatch: async (changedPaths) => {
			const currentFiles = collectContentFiles();
			const preparation = preparationForChanges(changedPaths, knownFiles, currentFiles);
			try {
				await applyAuthoringBatch(preparation, {
					onError(error) {
						console.error("[authoring] Content preparation failed; fix the edit and save again.", error);
					},
					onPrepared() {
						knownFiles = currentFiles;
					},
					prepare: prepareContent,
					restart: restartNext,
				});
			} catch (error) {
				console.error("[authoring] Next.js could not be restarted.", error);
			}
		},
	});

	contentWatcher = watch(contentDirectory, { recursive: true }, (_eventType, filename) => {
		batcher.notify(filename?.toString() || "");
	});
	contentWatcher.on("error", (error) => {
		console.error("[authoring] Content watcher failed.", error);
	});
	console.log(`[authoring] Watching ${path.relative(projectDirectory, contentDirectory)} for Markdown and asset changes.`);

	const shutdown = async (signal: NodeJS.Signals) => {
		if (shuttingDown) return;
		shuttingDown = true;
		batcher.close();
		contentWatcher?.close();
		await stopNext();
		process.exit(signal === "SIGINT" ? 130 : 143);
	};
	process.once("SIGINT", () => void shutdown("SIGINT"));
	process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
	console.error("[authoring] Initial content preparation failed; Next.js was not started.", error);
	process.exitCode = 1;
});
