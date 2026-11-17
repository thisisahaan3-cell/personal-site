import { site, type Role } from "@/content/site";
import { shown, tilesFor } from "@/lib/content";
import { Mark } from "@/components/Mark";
import { ONGOING, UNDATED } from "./stints";

const ui = site.ui.leadership;

function RoleList({ id, heading, rows }: { id: string; heading: string; rows: Role[] }) {
  // An organisation's mark appears once, never on the Rasmanjari or Lotus Young Leaders Summit rows.
  const tiles = tilesFor(rows, (r) => r.org, (r) => r.organisation);
  return (
    <section className="roles" aria-labelledby={id}>
      <h2 id={id} className="heading roles__title">
        {heading}
      </h2>
      <ol className="roles__list">
        {rows.map((r, i) => (
          <li key={r.title + r.organisation} className="role">
            <span className="role__period">{shown(r.period)}</span>
            <div className="role__main">
              <h3 className="role__title">{r.title}</h3>
              <p className="role__org">{r.organisation}</p>
              <ul className="role__points">
                {r.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <span className="role__mark">
              <Mark org={tiles[i]} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Undated and ongoing entries: listed here, never placed on the chart. */
export function Undated() {
  return (
    <section className="undated" aria-labelledby="undated-title">
      <div>
        <h2 id="undated-title" className="undated__title">
          {ui.undatedHeading}
        </h2>
        <ul className="undated__list">
          {UNDATED.map((u) => (
            <li key={u.title}>
              <span className="undated__name">{u.title}</span>
              <span className="undated__detail">{u.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="undated__title">{ui.ongoingHeading}</h2>
        <ul className="undated__list">
          {ONGOING.map((u) => (
            <li key={u.title}>
              <span className="undated__name">
                <span className="pulse" aria-hidden="true" /> {u.title}
              </span>
              <span className="undated__detail">{u.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Roles() {
  return (
    <>
      <RoleList id="positions-title" heading={ui.positionsHeading} rows={site.leadership} />
      <RoleList id="work-title" heading={ui.workHeading} rows={site.experience.filter((e) => e.org !== "srcc")} />
      <section className="skills" aria-labelledby="skills-title">
        <h2 id="skills-title" className="skills__title">
          {site.ui.about.skillsHeading}
        </h2>
        <ul className="skills__line">
          {site.skills.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
