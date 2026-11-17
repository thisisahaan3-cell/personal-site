import { site } from "@/content/site";
import { shown } from "@/lib/content";
import { Mark } from "@/components/Mark";
import { ENTRIES } from "./entries";

const ui = site.ui.work;

/** The same entries as a compact dated list, then the skills on one line. */
export function WorkList() {
  return (
    <section className="worklist" aria-labelledby="worklist-title">
      <h2 id="worklist-title" className="worklist__title">
        {ui.listHeading}
      </h2>
      <ol className="worklist__rows">
        {ENTRIES.map((e) => (
          <li key={e.id} className="worklist__row" data-kind={e.kind}>
            <span className="worklist__period">{shown(e.period)}</span>
            <span className="worklist__main">
              <span className="worklist__org">{e.organisation}</span>
              <span className="worklist__role">{e.title}</span>
            </span>
            <span className="worklist__mark">
              <Mark org={e.tile} />
            </span>
          </li>
        ))}
      </ol>
      <p className="worklist__skills">
        <span className="worklist__skills-label">{site.ui.about.skillsHeading}</span>
        <span>{site.skills.join(", ")}</span>
      </p>
    </section>
  );
}
