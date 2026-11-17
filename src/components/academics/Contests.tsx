import { site } from "@/content/site";
import { shown } from "@/lib/content";
import { Mark } from "@/components/Mark";
import { Quiz } from "./Quiz";

const ui = site.ui.academics;
const ACADEMIC = site.competitions.filter((c) => c.domain === "academic");
const QUIZZES = site.competitions.filter((c) => c.domain === "quiz");

type Comp = (typeof site.competitions)[number];

function Rows({ items }: { items: Comp[] }) {
  const seen = new Set<string>();
  return (
    <ol className="contest-rows">
      {items.map((c) => {
        const org = c.org && !seen.has(c.org) ? c.org : null;
        if (c.org) seen.add(c.org);
        return (
          <li key={c.name} className="contest-row">
            <span className="contest-row__year">{shown(c.year)}</span>
            <span className="contest-row__name">{c.name}</span>
            <span className="contest-row__result">
              {c.results.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </span>
            <span className="contest-row__mark">
              <Mark org={org} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Academic and quiz competitions as a short ruled record, the quiz beside the quiz results. */
export function Contests() {
  return (
    <section className="contests" aria-labelledby="contests-title">
      <h2 id="contests-title" className="heading contests__title">
        {ui.competitionsHeading}
      </h2>

      <h3 className="contests__sub">{ui.olympiadsHeading}</h3>
      <Rows items={ACADEMIC} />

      <div className="contests__quiz">
        <div className="contests__results">
          <h3 className="contests__sub">{ui.quizResultsHeading}</h3>
          <Rows items={QUIZZES} />
        </div>
        <Quiz />
      </div>

      <details className="more">
        <summary className="more__summary">
          <span>{ui.moreCompetitions}</span>
          <span className="more__count">{site.otherCompetitions.length}</span>
        </summary>
        <div className="more__body">
          <p className="more__label">{site.ui.competitions.alsoTookPart}</p>
          <ul className="more__list">
            {site.otherCompetitions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}
