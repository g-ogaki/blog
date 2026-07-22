import { afterEach, describe, expect, it, vi } from "vitest";
import { applyAuthoringBatch, createAuthoringBatcher, preparationForChanges } from "./authoring-changes";

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("authoring changes", () => {
	it("prepares existing Markdown and asset modifications without restarting", () => {
		const inventory = new Set(["2026/post/index.md", "2026/post/image.png"]);

		expect(preparationForChanges(["2026/post/index.md"], inventory, inventory)).toEqual({
			generateMetadata: true,
			publishAssets: true,
			restartNext: false,
		});
		expect(preparationForChanges(["2026/post/image.png"], inventory, inventory)).toEqual({
			generateMetadata: false,
			publishAssets: true,
			restartNext: false,
		});
	});

	it("restarts for persistent additions, deletions, and renames", () => {
		const previous = new Set(["2026/post/index.md", "2026/post/old.png"]);

		expect(preparationForChanges(
			["2026/post/new.png"],
			previous,
			new Set([...previous, "2026/post/new.png"]),
		)).toMatchObject({ publishAssets: true, restartNext: true });
		expect(preparationForChanges(
			["2026/post/old.png"],
			previous,
			new Set(["2026/post/index.md"]),
		)).toMatchObject({ publishAssets: true, restartNext: true });
		expect(preparationForChanges(
			["2026/post/old.png", "2026/post/renamed.png"],
			previous,
			new Set(["2026/post/index.md", "2026/post/renamed.png"]),
		)).toMatchObject({ publishAssets: true, restartNext: true });
	});

	it("does not restart when an atomic-save temporary file is gone before the scan", () => {
		const inventory = new Set(["2026/post/index.md"]);

		expect(preparationForChanges(
			["2026/post/.index.md.tmp", "2026/post/index.md"],
			inventory,
			inventory,
		)).toEqual({ generateMetadata: true, publishAssets: true, restartNext: false });
	});

	it("treats an unknown watcher path as a possible Markdown change", () => {
		const inventory = new Set(["2026/post/index.md"]);

		expect(preparationForChanges([""], inventory, inventory)).toEqual({
			generateMetadata: true,
			publishAssets: true,
			restartNext: false,
		});
	});

	it("debounces filesystem events into one path batch", async () => {
		vi.useFakeTimers();
		const onBatch = vi.fn().mockResolvedValue(undefined);
		const batcher = createAuthoringBatcher({ delayMs: 200, onBatch });

		batcher.notify("2026/post/image.png");
		batcher.notify("2026/post/index.md");
		batcher.notify("2026/post/index.md");
		await vi.advanceTimersByTimeAsync(199);
		expect(onBatch).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);
		expect(onBatch).toHaveBeenCalledWith(["2026/post/image.png", "2026/post/index.md"]);
	});

	it("retains the previous inventory and skips restart when preparation fails", async () => {
		const onPrepared = vi.fn();
		const restart = vi.fn().mockResolvedValue(undefined);

		await expect(applyAuthoringBatch(
			{ generateMetadata: true, publishAssets: true, restartNext: true },
			{
				onError: vi.fn(),
				onPrepared,
				prepare: vi.fn().mockRejectedValue(new Error("Incomplete frontmatter")),
				restart,
			},
		)).resolves.toBe(false);

		expect(onPrepared).not.toHaveBeenCalled();
		expect(restart).not.toHaveBeenCalled();
	});

	it("updates the inventory after preparation and restarts only when requested", async () => {
		const order: string[] = [];
		await expect(applyAuthoringBatch(
			{ generateMetadata: false, publishAssets: true, restartNext: true },
			{
				onError: vi.fn(),
				onPrepared: () => { order.push("inventory"); },
				prepare: async () => { order.push("prepare"); },
				restart: async () => { order.push("restart"); },
			},
		)).resolves.toBe(true);

		expect(order).toEqual(["prepare", "inventory", "restart"]);
	});
});
