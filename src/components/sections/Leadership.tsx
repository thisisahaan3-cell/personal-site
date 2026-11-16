import { site, type Role } from "@/content/site";
import { shown } from "@/lib/content";
import { Chapter, ChapterHead, LogoTile, Run } from "../primitives";

const ui = site.ui.leadership;

function RoleTable({ rows }: { rows: Role[] }) {
  return (
    <table className="ruled roles">
      <colgroup>
        <col style={{ width: "20%" }} />
        <col style={{ width: "40%" }} />
        <col />
        <col style={{ width: 136 }} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">{ui.columns.period}</th>
          <th scope="col">{ui.columns.role}</th>
          <th scope="col">{ui.columns.points}</th>
          <th scope="col" className="c-logo" />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.title + r.organisation} className="hov">
            <td className="c-year c-period">{shown(r.period)}</td>
            <td className="c-subj">
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
              <LogoTile org={r.org} />
            </td>
          </tr>
        ))}
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
