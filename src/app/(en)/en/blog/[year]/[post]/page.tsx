import type { Metadata } from "next";
import { generatePostMetadata, generatePostStaticParams, LocalizedPostPage, type PostPageParams } from "@/components/localized-post-page";

interface Props {
	params: Promise<PostPageParams>;
}

export const dynamicParams = false;
export function generateStaticParams() {
	return generatePostStaticParams("en");
}
export function generateMetadata({ params }: Props): Promise<Metadata> {
	return generatePostMetadata("en", params);
}
export default function EnglishPostPage({ params }: Props) {
	return <LocalizedPostPage locale="en" params={params} />;
}
