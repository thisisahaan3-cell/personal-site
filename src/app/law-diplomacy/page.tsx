import type { Metadata } from "next";
import { OwnMedia } from "@/components/OwnMedia";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Docket } from "@/components/mun/Docket";
import { Hall } from "@/components/mun/Hall";
import { LawCold } from "@/components/mun/LawCold";
import { Stage3D } from "@/components/three/Stage3D";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.ui.pages.modelUn };

/** Cold open (the chamber in plan), the chamber (dais, floor, bench, law corner), then the record. */
export default function Page() {
  return (
    <Stage3D>
      <SmoothScroll />
      <LawCold />
      <Hall />
      <Docket />
      <OwnMedia slot="modelUn" />
    </Stage3D>
  );
}
