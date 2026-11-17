import type { Metadata } from "next";
import { AviationGallery, Pointers } from "@/components/interests/Elsewhere";
import { Interests } from "@/components/interests/Interests";
import { Stage3D } from "@/components/three/Stage3D";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.ui.pages.interests };

/** The turntable (the page opens on it, h1 inside), his aviation photographs, then where the other interests are evidenced. */
export default function Page() {
  return (
    <Stage3D>
      <Interests />
      <AviationGallery />
      <Pointers />
    </Stage3D>
  );
}
