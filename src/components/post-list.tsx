import Link from "next/link";
import { formatPostDate } from "@/lib/format-date";

export interface PostListPost {
	metadata: {
		category: string;
		date: string;
		summary: string;
		tags: readonly string[];
		title: string;
	};
	url: string;
}

interface PostListProps {
	posts: readonly PostListPost[];
}

export function PostList({ posts }: PostListProps) {
	return (
		<div className="post-list">
			{posts.map((post, index) => (
				<article className="post-list-item" key={post.url}>
					<span className="post-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
					<div className="post-list-copy">
						<p className="post-meta">
							<time dateTime={post.metadata.date}>{formatPostDate(post.metadata.date)}</time>
							<span aria-hidden="true">/</span>
							<span>{post.metadata.category}</span>
						</p>
						<h2><Link href={post.url}>{post.metadata.title}</Link></h2>
						<p className="post-list-summary">{post.metadata.summary}</p>
						<ul className="tag-list" aria-label="タグ">
							{post.metadata.tags.map((tag) => <li key={tag}>#{tag}</li>)}
						</ul>
					</div>
					<Link className="post-list-arrow" href={post.url} aria-label={`${post.metadata.title}を読む`}>↗</Link>
				</article>
			))}
		</div>
	);
}
