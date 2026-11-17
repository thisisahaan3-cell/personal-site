import { site } from "@/content/site";
import { resolveMedia } from "@/lib/media.server";
import { statFor, type PageDef } from "@/lib/pages";
import { Footage } from "./Footage";
import { Recede } from "./Recede";

/** Beat one of every section page: full-viewport footage, the title in display-xl, one real figure. */
export function ColdOpen({ page }: { page: PageDef }) {
  const media = resolveMedia(page.media);
  const stat = statFor(page.stat);
  return (
    <section className="cold" aria-labelledby="page-title">
      <Footage video={media.video} poster={media.poster} />
      <Recede />
      <div className="cold__copy">
        <h1 id="page-title" className="display-xl cold__title">
          {page.id === "home" ? site.identity.name : site.ui.pages[page.id]}
        </h1>
        {stat ? (
          <p className="cold__stat">
            <span className="cold__figure">{stat.value}</span>
            <span className="cold__label">
              {stat.label}
              {stat.note ? <span className="cold__note">{stat.note}</span> : null}
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
