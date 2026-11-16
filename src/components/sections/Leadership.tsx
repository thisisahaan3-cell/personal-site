import { site, type Role } from "@/content/site";
import { shown, tilesFor } from "@/lib/content";
import { Chapter, ChapterHead, LogoTile, Run } from "../primitives";

const ui = site.ui.leadership;

function RoleTable({ rows }: { rows: Role[] }) {
  const tiles = tilesFor(rows, (r) => r.org, (r) => r.organisation);
  return (
    <table className="ruled roles">
      <colgroup>
        <col className="col-role" />
        <col className="col-points" />
        <col className="col-logo" />
      </colgroup>
      <thead className="sr-only-head">
        <tr>
          <th scope="col">{ui.columns.role}</th>
          <th scope="col">{ui.columns.points}</th>
          <th scope="col" className="c-logo" />
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const period = shown(r.period);
          return (
            <tr key={r.title + r.organisation} className="hov">
              <td className="c-subj">
                {period && (
                  /* Desktop: hangs in the note column beside a tick on the meridian (§0.1 item 4).
                     Tablet and phone: the row's first line. */
                  <span className="r-date">
                    <span className="r-date-text t-data">
                      {period}
                      <span className="r-tick" data-appear="" aria-hidden="true" />
                    </span>
                  </span>
                )}
                {r.title}
                <span className="sub-sm">{r.organisation}</span>
              </td>
              <td className="c-sm c-points">
                {r.points.map((p) => (
                  <p key={p} className="measure">
                    {p}
                  </p>
                ))}
              </td>
              <td className="c-logo">
                <LogoTile org={tiles[i]} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function Leadership() {
  return (
    <Chapter id="leadership">
      <ChapterHead id="leadership" />
      <Run className="pb-block">
        <h3 className="t-title2 sub">{ui.positionsHeading}</h3>
        <RoleTable rows={site.leadership} />
      </Run>
      <Run className="pb-block">
        <h3 className="t-title2 sub">{ui.experienceHeading}</h3>
        <RoleTable rows={site.experience} />
      </Run>
    </Chapter>
  );
}
