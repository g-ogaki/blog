import type { Metadata } from "next";
import { localizedRootMetadata, SiteDocument } from "@/components/site-document";
import "../globals.css";

export const metadata: Metadata = localizedRootMetadata("ja");

export default function JapaneseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <SiteDocument locale="ja">{children}</SiteDocument>;
}
