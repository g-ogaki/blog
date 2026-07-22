import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArticleImage } from "./article-image";

describe("ArticleImage", () => {
	beforeEach(() => {
		Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
			configurable: true,
			value: vi.fn(function showModal(this: HTMLDialogElement) {
				this.setAttribute("open", "");
			}),
		});
		Object.defineProperty(HTMLDialogElement.prototype, "close", {
			configurable: true,
			value: vi.fn(function close(this: HTMLDialogElement) {
				this.removeAttribute("open");
			}),
		});
	});

	afterEach(() => {
		delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
		delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
		vi.restoreAllMocks();
	});

	it("links to the original image and progressively opens and closes a dialog", () => {
		render(<ArticleImage alt="Diagram" closeLabel="Close enlarged image" openLabel="Enlarge image" src="/diagram.png" />);

		const fallbackLink = screen.getByRole("link", { name: "Enlarge image: Diagram" });
		expect(fallbackLink).toHaveAttribute("href", "/diagram.png");

		fireEvent.click(fallbackLink);
		const dialog = screen.getByRole("dialog", { name: "Enlarge image: Diagram" });
		expect(dialog).toHaveAttribute("open");

		fireEvent.click(screen.getByRole("button", { name: "Close enlarged image" }));
		expect(dialog).not.toHaveAttribute("open");
	});

	it("closes when the dialog backdrop is clicked", () => {
		render(<ArticleImage alt="Diagram" closeLabel="Close" openLabel="Enlarge" src="/diagram.png" />);
		fireEvent.click(screen.getByRole("link", { name: "Enlarge: Diagram" }));
		const dialog = screen.getByRole("dialog", { name: "Enlarge: Diagram" });

		fireEvent.click(dialog);

		expect(dialog).not.toHaveAttribute("open");
	});
});
