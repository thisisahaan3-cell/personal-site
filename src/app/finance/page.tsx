import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { OwnMedia } from "@/components/OwnMedia";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Bronze } from "@/components/finance/Bronze";
import { Desk } from "@/components/finance/Desk";
import { Field } from "@/components/finance/Field";
import { Ongoing, Record } from "@/components/finance/Record";
import { Stage3D } from "@/components/three/Stage3D";
import { site } from "@/content/site";
import { PAGES } from "@/lib/pages";
import { stillFor } from "@/lib/stills.server";

export const metadata: Metadata = { title: site.ui.pages.finance };

/** Cold open, the bronze (four results), the field, Artha on the desk, then Wharton, GITAM and the record. */
export default function Page() {
  return (
    <Stage3D>
      <SmoothScroll />
      <ColdOpen page={PAGES.finance} />
      <Bronze still={stillFor("finance")} />
      <Field />
      <Desk />
      <OwnMedia slot="finance" />
      <Ongoing />
      <Record />
    </Stage3D>
  );
}
