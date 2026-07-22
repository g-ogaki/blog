import GithubSlugger, { slug } from "github-slugger";
import type { ElementContent, Root, RootContent } from "hast";

export interface TableOfContentsEntry {
	children: TableOfContentsEntry[];
	id: string;
	label: string;
	level: 2 | 3 | 4;
}

interface TableOfContentsOptions {
	entries: TableOfContentsEntry[];
}

function toText(children: readonly ElementContent[]): string {
	return children.map((child) => {
		if (child.type === "text") return child.value;
		if (child.type === "element") return toText(child.children);
		return "";
	}).join("");
}

export function rehypeTableOfContents({ entries }: TableOfContentsOptions) {
	return (tree: Root) => {
		const slugger = new GithubSlugger();
		const latestByLevel = new Map<number, TableOfContentsEntry>();
		entries.length = 0;

		const walk = (children: readonly RootContent[], insideDetails: boolean) => {
			for (const child of children) {
				if (child.type !== "element") continue;
				const nextInsideDetails = insideDetails || child.tagName === "details";
				if (!nextInsideDetails && (child.tagName === "h2" || child.tagName === "h3" || child.tagName === "h4")) {
					const level = Number(child.tagName.slice(1)) as 2 | 3 | 4;
					const label = toText(child.children).trim();
					const id = slugger.slug(slug(label) || "section");
					const entry: TableOfContentsEntry = { children: [], id, label, level };
					child.properties.id = id;

					const parent = Array.from({ length: level - 2 }, (_, index) => latestByLevel.get(level - index - 1))
						.find((candidate) => candidate !== undefined);
					if (parent) parent.children.push(entry);
					else entries.push(entry);
					latestByLevel.set(level, entry);
					for (let deeper = level + 1; deeper <= 4; deeper += 1) latestByLevel.delete(deeper);
				}
				walk(child.children, nextInsideDetails);
			}
		};

		walk(tree.children, false);
	};
}
