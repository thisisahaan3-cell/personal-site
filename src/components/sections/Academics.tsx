import { site } from "@/content/site";
import { tilesFor } from "@/lib/content";
import { Chapter, ChapterHead, Col, LogoTile, Run } from "../primitives";

const ui = site.ui;
const edu = site.education;

export function Academics() {
  const courseTiles = tilesFor(site.courses, (c) => c.org, (c) => c.title);
  const gx = edu.gradeX;
  const honours = [edu.honours[0], edu.honours[2], edu.honours[3]];
  return (
    <Chapter id="academics">
      <ChapterHead id="academics" />

      <Run className="pb-block">
        <div className="grid10 align-last-baseline">
          <Col d={[3, 7]} t={[1, 3]}>
            <p className="t-numeral">{gx.score}</p>
          </Col>
          <Col d={[8, 12]} t={[4, 6]}>
            <ul className="rlist hov t-small">
              <li>
                <span className="rl-main">
                  {gx.exam} ({gx.yearAsWritten})
                </span>
                <span className="rl-side">
                  <LogoTile org={gx.org} />
                </span>
              </li>
              {gx.extras.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Col>
        </div>
      </Run>

      <Run className="pb-block">
        <ul className="rlist hov t-small">
          <li>
            <span className="rl-main">
              <span className="t-tfig block">{edu.institution}</span>
            </span>
            <span className="rl-side">
              <span className="t-data">{edu.period}</span>
              <LogoTile org={edu.org} />
            </span>
          </li>
          <li>{edu.current}</li>
          <li>{edu.consistency}</li>
          {honours.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </Run>

      <Run className="pb-block">
        <div className="badges">
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className="badge-tick"
              style={{ top: 8 + i * 40 }}
              data-appear=""
              aria-hidden="true"
            />
          ))}
          <span className="badge-year t-data" aria-hidden="true">
            2021
          </span>
          <div className="grid10 w-full">
            <Col d={[3, 8]} t={[1, 5]}>
              <p className="t-body measure">{edu.honours[1]}</p>
            </Col>
          </div>
        </div>
      </Run>

      <Run className="pb-block">
        <h3 className="t-title2 sub">{ui.academics.coursesHeading}</h3>
        <table className="ruled">
          <thead>
            <tr>
              <th scope="col">{ui.academics.columns.year}</th>
              <th scope="col">{ui.academics.columns.course}</th>
              <th scope="col">{ui.academics.columns.provider}</th>
              <th scope="col">{ui.academics.columns.detail}</th>
              <th scope="col" className="c-logo" />
            </tr>
          </thead>
          <tbody>
            {site.courses.map((c, i) => (
              <tr key={c.title} className="hov">
                <td className="c-year">{c.year}</td>
                <td className="c-subj" style={{ maxWidth: 320 }}>
                  {c.title}
                </td>
                <td className="c-sm">{c.provider}</td>
                <td className="c-sm c-desc">{c.detail}</td>
                <td className="c-logo">
                  <LogoTile org={courseTiles[i]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Run>
    </Chapter>
  );
}
