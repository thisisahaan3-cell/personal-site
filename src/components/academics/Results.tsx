import { site, type AcademicResult } from "@/content/site";
import { shown, tilesFor } from "@/lib/content";
import { Mark } from "@/components/Mark";

const ui = site.ui.academicsPage;
const A = site.academics;

/**
 * The record, in the client's order: three headline results set large (figure first, in the
 * page's instrument face), then the other results with ranks where given, then the
 * participation list behind a disclosure.
 */
export function Results() {
  const marks = tilesFor(A.headlineResults, (r) => r.org, (r) => r.name);
  const otherMarks = tilesFor(A.otherResults, (r) => r.org, (r) => r.name);
  return (
    <section className="results" aria-labelledby="results-title">
      <h2 id="results-title" className="results__kicker">
        {ui.headlineHeading}
      </h2>
      <ol className="results__head">
        {A.headlineResults.map((r, i) => (
          <Headline key={r.id} r={r} mark={marks[i]} />
        ))}
      </ol>

      <h3 className="results__kicker results__kicker--other">{ui.otherHeading}</h3>
      <ol className="results__other">
        {A.otherResults.map((r, i) => (
          <li key={r.id} className="other">
            <span className="other__figure">{r.figure}</span>
            <span className="other__main">
              <span className="other__name">{r.name}</span>
              {r.detail ? <span className="other__detail">{r.detail}</span> : null}
            </span>
            <span className="other__year">{shown(r.year)}</span>
            <span className="other__mark">
              <Mark org={otherMarks[i]} />
            </span>
          </li>
        ))}
      </ol>

      <details className="more results__more">
        <summary className="more__summary">
          <span>{ui.participationHeading}</span>
          <span className="more__count">{A.participation.length}</span>
        </summary>
        <div className="more__body">
          <ul className="more__list">
            {A.participation.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}

function Headline({ r, mark }: { r: AcademicResult; mark: string | null }) {
  return (
    <li className="headline">
      <p className="headline__figure">
        <span className="headline__value">{r.figure}</span>
        {r.outOf ? <span className="headline__of">{r.outOf}</span> : null}
        {r.tag ? <span className="headline__tag">{r.tag}</span> : null}
      </p>
      <div className="headline__body">
        <h3 className="headline__name">{r.name}</h3>
        <p className="headline__meta">
          <span className="headline__year">{shown(r.year)}</span>
          {r.detail ? <span>{r.detail}</span> : null}
        </p>
        {r.secondary ? (
          <p className="headline__second">
            <span className="headline__second-label">{r.secondary.label}</span>
            <span className="headline__second-figure">
              {r.secondary.figure}
              {r.secondary.outOf ? <span className="headline__of"> {r.secondary.outOf}</span> : null}
            </span>
            {r.secondary.detail ? <span className="headline__second-detail">{r.secondary.detail}</span> : null}
          </p>
        ) : null}
      </div>
      <span className="headline__mark">
        <Mark org={mark} />
      </span>
    </li>
  );
}
