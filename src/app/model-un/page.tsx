import type { Metadata } from "next";
import { site } from "@/content/site";
import { PAGES } from "@/lib/pages";
import { Redirect } from "./Redirect";

/**
 * The old Model UN address. Netlify answers it with a 301 (public/_redirects); this stub covers
 * any other static host: it sends the visitor on at once and links to the new page.
 */
export const metadata: Metadata = {
  title: site.ui.pages.modelUn,
  robots: { index: false },
  alternates: { canonical: PAGES.modelUn.href },
};

export default function Page() {
  return (
    <section className="moved">
      <meta httpEquiv="refresh" content={`0; url=${PAGES.modelUn.href}`} />
      <Redirect to={PAGES.modelUn.href} />
      <p className="moved__line">
        <a href={PAGES.modelUn.href}>{site.ui.pages.modelUn}</a>
      </p>
    </section>
  );
}
