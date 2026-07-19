import type { Metadata } from "next";
import { generatePostMetadata, generatePostStaticParams, LocalizedPostPage, type PostPageParams } from "@/components/localized-post-page";

interface Props {
	params: Promise<PostPageParams>;
}

export const dynamicParams = false;
export function generateStaticParams() {
	return generatePostStaticParams("ja");
}
export function generateMetadata({ params }: Props): Promise<Metadata> {
	return generatePostMetadata("ja", params);
}
export default function JapanesePostPage({ params }: Props) {
	return <LocalizedPostPage locale="ja" params={params} />;
}
