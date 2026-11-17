import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Contests } from "@/components/academics/Contests";
import { Courses } from "@/components/academics/Courses";
import { School } from "@/components/academics/School";
import { Tape } from "@/components/academics/Tape";
import { site } from "@/content/site";
import { resolveMedia } from "@/lib/media.server";
import { PAGES } from "@/lib/pages";

export const metadata: Metadata = { title: site.ui.pages.academics };

export default function Page() {
  const sky = resolveMedia("m5");
  return (
    <>
      <SmoothScroll />
      <ColdOpen page={PAGES.academics} />
      <Tape video={sky.video} poster={sky.poster} />
      <School />
      <Courses />
      <Contests />
    </>
  );
}
