export interface AuthoringPreparation {
	generateMetadata: boolean;
	publishAssets: boolean;
	restartNext: boolean;
}

interface AuthoringBatcherOptions {
	delayMs: number;
	onBatch: (changedPaths: readonly string[]) => Promise<void>;
}

interface ApplyAuthoringBatchOptions {
	onError: (error: unknown) => void;
	onPrepared: () => void;
	prepare: (preparation: AuthoringPreparation) => Promise<void>;
	restart: () => Promise<void>;
}

function structuralPaths(previousFiles: ReadonlySet<string>, currentFiles: ReadonlySet<string>) {
	return [
		...[...currentFiles].filter((file) => !previousFiles.has(file)),
		...[...previousFiles].filter((file) => !currentFiles.has(file)),
	];
}

export function preparationForChanges(
	changedPaths: Iterable<string>,
	previousFiles: ReadonlySet<string>,
	currentFiles: ReadonlySet<string>,
): AuthoringPreparation {
	const paths = [...changedPaths];
	const changedStructure = structuralPaths(previousFiles, currentFiles);
	const unknownPath = paths.includes("");
	return {
		generateMetadata: unknownPath || [...paths, ...changedStructure].some((file) => file.toLowerCase().endsWith(".md")),
		publishAssets: paths.length > 0 || changedStructure.length > 0,
		restartNext: changedStructure.length > 0,
	};
}

export async function applyAuthoringBatch(
	preparation: AuthoringPreparation,
	{ onError, onPrepared, prepare, restart }: ApplyAuthoringBatchOptions,
) {
	try {
		await prepare(preparation);
	} catch (error) {
		onError(error);
		return false;
	}

	onPrepared();
	if (preparation.restartNext) await restart();
	return true;
}

export function createAuthoringBatcher({ delayMs, onBatch }: AuthoringBatcherOptions) {
	const pendingPaths = new Set<string>();
	let closed = false;
	let processing = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	const schedule = () => {
		if (closed || processing || timer) return;
		timer = setTimeout(() => {
			timer = undefined;
			void flush();
		}, delayMs);
	};

	const flush = async () => {
		if (closed || processing || pendingPaths.size === 0) return;
		processing = true;
		const paths = [...pendingPaths];
		pendingPaths.clear();
		try {
			await onBatch(paths);
		} finally {
			processing = false;
			schedule();
		}
	};

	return {
		close() {
			closed = true;
			pendingPaths.clear();
			if (timer) clearTimeout(timer);
			timer = undefined;
		},
		notify(changedPath: string) {
			if (closed) return;
			pendingPaths.add(changedPath);
			schedule();
		},
	};
}
