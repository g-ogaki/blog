import type { Metadata } from "next";
import { localizedRootMetadata, SiteDocument } from "@/components/site-document";
import "../../globals.css";

export const metadata: Metadata = localizedRootMetadata("en");

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <SiteDocument locale="en">{children}</SiteDocument>;
}
