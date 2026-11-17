import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { OwnMedia } from "@/components/OwnMedia";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Chamber } from "@/components/mun/Chamber";
import { Docket } from "@/components/mun/Docket";
import { site } from "@/content/site";
import { PAGES } from "@/lib/pages";

export const metadata: Metadata = { title: site.ui.pages.modelUn };

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <ColdOpen page={PAGES.modelUn} />
      <Chamber />
      <Docket />
      <OwnMedia slot="modelUn" />
    </>
  );
}
