import GithubSlugger, { slug } from "github-slugger";
import type { Heading, Root } from "mdast";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

export interface TableOfContentsEntry {
	children: TableOfContentsEntry[];
	id: string;
	label: string;
	level: 2 | 3;
}

interface TableOfContentsOptions {
	entries: TableOfContentsEntry[];
}

export function remarkTableOfContents({ entries }: TableOfContentsOptions) {
	return (tree: Root) => {
		const slugger = new GithubSlugger();
		entries.length = 0;

		visit(tree, "heading", (heading: Heading) => {
			if (heading.depth !== 2 && heading.depth !== 3) return;
			const label = toString(heading).trim();
			const id = slugger.slug(slug(label) || "section");
			const entry: TableOfContentsEntry = { children: [], id, label, level: heading.depth };

			heading.data ??= {};
			heading.data.hProperties = { ...heading.data.hProperties, id };

			const parent = entries.at(-1);
			if (heading.depth === 3 && parent?.level === 2) parent.children.push(entry);
			else entries.push(entry);
		});
	};
}
