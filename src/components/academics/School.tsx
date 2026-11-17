import { site } from "@/content/site";
import { Mark } from "@/components/Mark";

const ui = site.ui.academics;
const edu = site.education;
const consistency = site.stats.find((s) => s.id === "consistency");

/** The school record: current standing, the Grade X result, consistency, honours as written. */
export function School() {
  return (
    <section className="school" aria-labelledby="school-title">
      <div className="school__side">
        <h2 id="school-title" className="heading school__title">
          {ui.schoolHeading}
        </h2>
        <p className="school__label">{ui.sinceLabel}</p>
        <p className="school__name">{edu.institution}</p>
        <p className="school__period">{edu.period}</p>
        <p className="school__current">{edu.current}</p>
        <Mark org={edu.org} />
      </div>

      <div className="school__main">
        <ul className="school__rows">
          <li className="school__row">
            <span className="school__figure" data-amber="">
              {edu.gradeX.score}
            </span>
            <span className="school__what">
              <span className="school__exam">{edu.gradeX.exam}</span>
              {edu.gradeX.extras.map((x) => (
                <span key={x} className="school__extra">
                  {x}
                </span>
              ))}
            </span>
            <span className="school__mark">
              <Mark org={edu.gradeX.org} />
            </span>
          </li>
          {consistency ? (
            <li className="school__row">
              <span className="school__figure">{consistency.value}</span>
              <span className="school__what">
                <span className="school__exam">{edu.consistency}</span>
              </span>
              <span className="school__mark" />
            </li>
          ) : null}
        </ul>

        <h3 className="school__sub">{ui.honoursHeading}</h3>
        <ul className="school__honours">
          {edu.honours.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
