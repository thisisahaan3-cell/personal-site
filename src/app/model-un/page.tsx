import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { site } from "@/content/site";
import { PAGES } from "@/lib/pages";

export const metadata: Metadata = { title: site.ui.pages.modelUn };

export default function Page() {
  return <ColdOpen page={PAGES.modelUn} />;
}
