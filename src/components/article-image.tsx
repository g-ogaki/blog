"use client";

import { useRef, type ImgHTMLAttributes, type MouseEvent } from "react";

interface ArticleImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
	closeLabel: string;
	openLabel: string;
	src: string;
}

function MagnifierIcon() {
	return (
		<svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
			<circle cx="10.5" cy="10.5" r="5.5" />
			<path d="m15 15 5 5M10.5 8v5M8 10.5h5" />
		</svg>
	);
}

export function ArticleImage({ alt = "", closeLabel, openLabel, src, ...imageProperties }: ArticleImageProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const accessibleOpenLabel = alt ? `${openLabel}: ${alt}` : openLabel;

	const openDialog = (event: MouseEvent<HTMLAnchorElement>) => {
		const dialog = dialogRef.current;
		if (!dialog?.showModal) return;
		event.preventDefault();
		dialog.showModal();
	};

	const closeDialog = () => dialogRef.current?.close();

	return (
		<>
			<a aria-label={accessibleOpenLabel} className="article-image-link group" href={src} onClick={openDialog}>
				{/* Article assets have author-controlled intrinsic dimensions. */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img {...imageProperties} alt={alt} src={src} />
				<span aria-hidden="true" className="article-image-magnifier"><MagnifierIcon /></span>
			</a>
			<dialog
				aria-label={accessibleOpenLabel}
				className="article-image-dialog"
				onClick={(event) => {
					if (event.target === event.currentTarget) closeDialog();
				}}
				ref={dialogRef}
			>
				<div className="article-image-dialog__content">
					<button aria-label={closeLabel} className="article-image-dialog__close" onClick={closeDialog} type="button">×</button>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img alt={alt} src={src} />
				</div>
			</dialog>
		</>
	);
}
