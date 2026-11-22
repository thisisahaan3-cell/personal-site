import Image from "next/image";
import { site } from "@/content/site";
import { fill } from "@/lib/content";
import { PAGES, type PageId } from "@/lib/pages";
import { TransitionLink } from "@/components/shell/Transition";

const page = site.interestsPage;
const ui = site.ui.interests;

/**
 * His aviation photographs, hung as a row of cabin windows. Empty slots are not shown, and the
 * section is hidden until at least one photograph is added; nothing stands in for his own pictures.
 * Fill the slots in `site.interestsPage.items[aviation].gallery` (see MEDIA.md).
 */
export function AviationGallery() {
  // Only the frames that have a photograph; the whole gallery stays hidden until the first one is added.
  const slots = (page.items.find((i) => i.id === "aviation")?.gallery ?? []).filter((s) => s.src);
  if (!slots.length) return null;
  return (
    <section className="cabin" aria-labelledby="cabin-title">
      <div className="cabin__head">
        <h2 id="cabin-title" className="cabin__title">
          {ui.galleryHeading}
        </h2>
        <p className="cabin__lead">{ui.galleryLead}</p>
      </div>
      <ul className="cabin__row">
        {slots.map((s, i) => (
          <li key={i} className="cabin__slot">
            <figure className="cabin__window" data-empty={s.src ? undefined : ""}>
              <div className="cabin__pane">
                {s.src ? (
                  <Image src={s.src} alt={s.alt} fill sizes="(max-width: 760px) 45vw, 16vw" className="cabin__photo" />
                ) : (
                  <span className="cabin__blind" role="img" aria-label={fill(ui.frameLabel, { n: i + 1 })}>
                    <span className="cabin__tab" aria-hidden="true" />
                    <span className="cabin__soon" aria-hidden="true">
                      {ui.photoToCome}
                    </span>
                  </span>
                )}
              </div>
              {s.src && s.caption ? <figcaption className="cabin__caption">{s.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Where finance, law, quizzing and Model UN are evidenced. */
export function Pointers() {
  return (
    <section className="pointers" aria-labelledby="pointers-title">
      <h2 id="pointers-title" className="pointers__title">
        {ui.pointersHeading}
      </h2>
      <p className="pointers__lead">{page.descriptor}</p>
      <ul className="pointers__list">
        {page.pointers.map((p) => {
          const def = PAGES[p.page as PageId];
          return (
            <li key={p.id}>
              <TransitionLink href={def.href} className="pointer" data-page-to={p.page}>
                <span className="pointer__name">{p.name}</span>
                <span className="pointer__line">{p.line}</span>
                <span className="pointer__page">{site.ui.pages[def.id as Exclude<PageId, "home">]}</span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
