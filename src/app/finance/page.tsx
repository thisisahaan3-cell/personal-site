import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { OwnMedia } from "@/components/OwnMedia";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Artha } from "@/components/finance/Artha";
import { Field } from "@/components/finance/Field";
import { Ongoing, Record } from "@/components/finance/Record";
import { site } from "@/content/site";
import { PAGES } from "@/lib/pages";

export const metadata: Metadata = { title: site.ui.pages.finance };

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <ColdOpen page={PAGES.finance} />
      <Field />
      <Artha />
      <OwnMedia slot="finance" />
      <Ongoing />
      <Record />
    </>
  );
}
