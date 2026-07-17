import Image from "next/image";
import Link from "next/link";
import { formatPostDate } from "@/lib/format-date";

export interface PostListPost {
	imageUrl?: string;
	metadata: {
		category: string;
		date: string;
		summary: string;
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
		<div className={`post-thumbnail${imageUrl ? "" : " post-thumbnail--empty"}`}>
			{imageUrl ? <Image alt="" fill sizes="(max-width: 36rem) 100vw, (max-width: 64rem) 12rem, 15rem" src={imageUrl} unoptimized /> : <EmptyThumbnail />}
		</div>
	);
}

interface PostListProps {
	posts: readonly PostListPost[];
}

export function PostList({ posts }: PostListProps) {
	return (
		<div className="post-list">
			{posts.map((post) => (
				<article className="post-row" key={post.url}>
					<Link aria-label={post.metadata.title} className="post-row-link" href={post.url}>
						<div className="post-row-copy">
							{post.metadata.date || post.metadata.category ? <p className="post-meta">{post.metadata.date ? <time dateTime={post.metadata.date}>{formatPostDate(post.metadata.date)}</time> : null}{post.metadata.category ? <span>{post.metadata.category}</span> : null}</p> : null}
							<h3>{post.metadata.title}</h3>
							{post.metadata.tags.length ? <ul aria-label="タグ" className="post-tags">{post.metadata.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}
						</div>
						<PostThumbnail imageUrl={post.imageUrl} />
					</Link>
				</article>
			))}
		</div>
	);
}
