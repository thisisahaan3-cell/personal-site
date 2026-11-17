import Image from "next/image";
import { site } from "@/content/site";
import { Footage } from "@/components/Footage";
import { Mark } from "@/components/Mark";
import { resolveMedia } from "@/lib/media.server";
import { Drift } from "@/components/Drift";

const ui = site.ui.academics;
const courses = site.courses;
const aero = courses.find((c) => /aerospace/i.test(c.title));
const law = courses.find((c) => /law/i.test(c.title));
const rest = courses.filter((c) => c !== aero && c !== law);

/** The course entries never carry a logo for the Lotus Young Leaders Summit (organiser unconfirmed). */
const markFor = (c: (typeof courses)[number]) => (/^Lotus Young Leaders Summit/.test(c.title) ? null : c.org);

/**
 * Courses: the aerospace entry as a flight strip beside the aircraft loop (M6); the law entry as a
 * docket (Bodoni, ruled, date in the margin) beside the colonnade still (M7); the rest as a row.
 */
export function Courses() {
  const m6 = resolveMedia("m6");
  const m7 = resolveMedia("m7").poster;
  return (
    <section className="courses" aria-labelledby="courses-title">
      <h2 id="courses-title" className="heading courses__title">
        {ui.coursesHeading}
      </h2>

      {aero ? (
        <article className="course course--air" aria-labelledby="course-air">
          <Drift className="course__media course__media--loop">
            <Footage video={m6.video} poster={m6.poster} />
          </Drift>
          <div className="strip">
            <div className="strip__cells">
              <span className="strip__year">{aero.year}</span>
              <span className="strip__id">
                <h3 id="course-air" className="strip__title">
                  {aero.title}
                </h3>
                <span className="strip__provider">{aero.provider}</span>
              </span>
              <span className="strip__mark">
                <Mark org={markFor(aero)} />
              </span>
            </div>
            <p className="strip__detail">{aero.detail}</p>
          </div>
        </article>
      ) : null}

      {law ? (
        <article className="course course--law" aria-labelledby="course-law">
          <div className="docket-entry">
            <span className="docket-entry__margin">{law.year}</span>
            <div className="docket-entry__body">
              <h3 id="course-law" className="docket-entry__title">
                {law.title}
              </h3>
              <p className="docket-entry__provider">
                {law.provider}
                <Mark org={markFor(law)} />
              </p>
              <p className="docket-entry__detail">{law.detail}</p>
            </div>
          </div>
          <Drift className="course__media course__media--still" amount={10}>
            <div className="footage">
              {m7 ? <Image className="footage__media" src={m7} alt="" fill sizes="(max-width: 760px) 100vw, 40vw" /> : null}
              <div className="footage__grade" />
            </div>
          </Drift>
        </article>
      ) : null}

      {rest.length ? (
        <ul className="course-rows">
          {rest.map((c) => (
            <li key={c.title} className="course-row">
              <span className="course-row__year">{c.year}</span>
              <span className="course-row__title">{c.title}</span>
              <span className="course-row__provider">{c.provider}</span>
              <span className="course-row__detail">{c.detail}</span>
              <span className="course-row__mark">
                <Mark org={markFor(c)} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
