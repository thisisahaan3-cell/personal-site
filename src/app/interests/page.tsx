import type { Metadata } from "next";
import { ColdOpen } from "@/components/ColdOpen";
import { site } from "@/content/site";
import { PAGES } from "@/lib/pages";

export const metadata: Metadata = { title: site.ui.pages.interests };

const page = site.interestsPage;

/**
 * Interests: a stub in the final shell until the turntable is built (Run B). It already lists
 * each interest with what he has done, so nothing on it is provisional except the set piece.
 */
export default function Page() {
  return (
    <>
      <ColdOpen page={PAGES.interests} />
      <section className="stub" aria-labelledby="stub-title">
        <h2 id="stub-title" className="sr-only">
          {site.ui.interestsStub.list}
        </h2>
        <p className="stub__lead">{page.descriptor}</p>
        <ul className="stub__list">
          {page.items.map((it) => (
            <li key={it.id} className="stub__row" data-interest={it.id}>
              <span className="stub__name">{it.name}</span>
              <span className="stub__facts">
                {it.facts.map((f) => (
                  <span key={f.text}>{f.text}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="stub__note">{site.ui.interestsStub.lead}</p>
      </section>
    </>
  );
}
