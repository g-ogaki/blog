import Image from "next/image";
import Link from "next/link";
import { formatPostDate } from "@/lib/format-date";

export interface PostListPost {
	imageUrl?: string;
	metadata: {
		category: string;
		date: string;
		tags: readonly string[];
		title: string;
	};
	url: string;
}

function EmptyThumbnail() {
	return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><rect height="16" rx="2" width="18" x="3" y="4" /><circle cx="9" cy="9" r="1.5" /><path d="m5 18 4.5-4.5 3 3 2-2L19 18" /></svg>;
}

export function PostThumbnail({ imageUrl }: { imageUrl?: string }) {
	return (
		<div className={`thumbnail relative order-first grid aspect-video w-full place-items-center overflow-hidden rounded-lg border border-site-border bg-surface-subtle text-text-muted sm:order-none [&_svg]:size-6 [&_svg]:stroke-current${imageUrl ? "" : " thumbnail--empty"}`}>
			{imageUrl ? <Image alt="" className="object-cover" fill sizes="(max-width: 36rem) 100vw, (max-width: 64rem) 12rem, 15rem" src={imageUrl} unoptimized /> : <EmptyThumbnail />}
		</div>
	);
}

interface PostListProps {
	posts: readonly PostListPost[];
}

export function PostList({ posts }: PostListProps) {
	return (
		<div className="post-list border-t border-site-border">
			{posts.map((post) => (
				<article className="post-row border-b border-site-border" key={post.url}>
					<Link aria-label={post.metadata.title} className="post-row__link group flex flex-col gap-6 py-8 text-inherit no-underline sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(10rem,12rem)] lg:grid-cols-[minmax(0,1fr)_minmax(12rem,15rem)] lg:gap-8" href={post.url}>
						<div className="post-row-copy">
							{post.metadata.date || post.metadata.category ? <p className="post-meta m-0 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs leading-6 text-text-muted">{post.metadata.date ? <time dateTime={post.metadata.date}>{formatPostDate(post.metadata.date)}</time> : null}{post.metadata.category ? <span>{post.metadata.category}</span> : null}</p> : null}
							<h3 className="mt-3 text-xl leading-7 font-semibold group-hover:text-action-hover">{post.metadata.title}</h3>
							{post.metadata.tags.length ? <ul aria-label="タグ" className="post-tags mt-4 flex list-none flex-wrap gap-2 p-0">{post.metadata.tags.map((tag) => <li className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-text-muted" key={tag}>{tag}</li>)}</ul> : null}
						</div>
						<PostThumbnail imageUrl={post.imageUrl} />
					</Link>
				</article>
			))}
		</div>
	);
}
