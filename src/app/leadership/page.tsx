import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { OwnMedia } from "@/components/OwnMedia";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Dossiers } from "@/components/leadership/Dossiers";
import { WorkList } from "@/components/leadership/WorkList";
import { Stage3D } from "@/components/three/Stage3D";
import { site } from "@/content/site";
import { resolveMedia } from "@/lib/media.server";
import { PAGES } from "@/lib/pages";

export const metadata: Metadata = { title: site.ui.pages.leadership };

/** Cold open, the dossiers (every entry, internships first), the same entries in brief with the skills, his own media. */
export default function Page() {
  const canopy = resolveMedia("m8");
  return (
    <Stage3D>
      <SmoothScroll />
      <ColdOpen page={PAGES.leadership} />
      <Dossiers video={canopy.video} />
      <WorkList />
      <OwnMedia slot="leadership" />
    </Stage3D>
  );
}
