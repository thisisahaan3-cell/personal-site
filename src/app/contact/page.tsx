import type { Metadata } from "next";
import { Contact } from "@/components/contact/Contact";
import { Stage3D } from "@/components/three/Stage3D";
import { site } from "@/content/site";

export const metadata: Metadata = { title: site.ui.pages.contact };

/** One screen: the desk at night beside the links (h1 inside). The credits footer follows (Shell). */
export default function Page() {
  return (
    <Stage3D>
      <Contact />
    </Stage3D>
  );
}
