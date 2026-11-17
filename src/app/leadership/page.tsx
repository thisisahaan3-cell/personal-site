import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { OwnMedia } from "@/components/OwnMedia";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Roles, Undated } from "@/components/leadership/Roles";
import { Stints } from "@/components/leadership/Stints";
import { site } from "@/content/site";
import { PAGES } from "@/lib/pages";

export const metadata: Metadata = { title: site.ui.pages.leadership };

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <ColdOpen page={PAGES.leadership} />
      <Stints />
      <Undated />
      <Roles />
      <OwnMedia slot="leadership" />
    </>
  );
}
