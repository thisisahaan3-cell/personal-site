import { site } from "@/content/site";
import { interest, stat, tilesFor } from "@/lib/content";
import { Chapter, ChapterHead, Col, EditableText, LogoTile, Run } from "../primitives";
import { Globe, MunProvider, Placard, Record, Tally } from "./MunClient";

const ui = site.ui;
const mun = site.mun;

export function Mun() {
  const boardTiles = tilesFor(mun.executiveBoard, (b) => ("org" in b ? b.org : null), (b) => b.conference);
  const lead = stat("delegateAwards");
  const listed = [stat("conferences"), stat("awardsSummary")];
  return (
    <Chapter id="mun" className="clip-x">
      <MunProvider>
        <ChapterHead id="mun" />
        {/* The Academic chapter's pattern: one numeral, then a two-row ruled list (§0.1 item 6). */}
        <Run className="pb-fig">
          <div className="grid10 align-last-baseline mun-sum">
            <Col d={[3, 7]} t={[1, 3]} className="mun-sum-num">
              <p className="t-numeral">{lead.value}</p>
            </Col>
            <Col d={[8, 12]} t={[4, 6]} className="mun-sum-list">
              <ul className="rlist t-small">
                {listed.map((s) => (
                  <li key={s.id}>
                    <span className="mun-sum-row">
                      <span className="t-tfig">{s.value}</span>
                      <span>{s.label}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Col>
            <Col d={[3, 7]} t={[1, 3]} className="mun-sum-cap">
              <p className="t-small fg2">
                {lead.label}
                {lead.note && (
                  <>
                    <br />
                    {lead.note}
                  </>
                )}
              </p>
            </Col>
          </div>
        </Run>

        <Globe
          side={
            <Run className="globe-side">
              <h3 className="t-title2 italic sub">{ui.mun.geopoliticsHeading}</h3>
              <EditableText value={interest("mun").description} slot={ui.placeholder.slots.geopolitics} />
              <Placard />
            </Run>
          }
        />

        <Run className="pt-fig pb-block">
          <h3 className="t-title2 sub">{ui.mun.executiveBoardHeading}</h3>
          <table className="ruled">
            <thead>
              <tr>
                <th scope="col">{ui.mun.columns.conference}</th>
                <th scope="col">{ui.mun.columns.role}</th>
                <th scope="col">{ui.mun.columns.committee}</th>
                <th scope="col">{ui.mun.columns.year}</th>
                <th scope="col" className="c-logo" />
              </tr>
            </thead>
            <tbody>
              {mun.executiveBoard.map((b, i) => (
                <tr key={b.conference} className="hov">
                  <td className="c-subj">{b.conference}</td>
                  <td className="c-sm">{b.role}</td>
                  <td className="c-sm">{b.committee}</td>
                  <td className="c-year">{b.year ?? ""}</td>
                  <td className="c-logo">
                    <LogoTile org={boardTiles[i]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Run>

        <Run className="pb-block">
          <h3 className="t-title2 sub">{ui.mun.awardsHeading}</h3>
          <Tally />
          <Record />
        </Run>

        <Run className="pb-block">
          <h3 className="t-title2 sub">{ui.mun.parliamentaryHeading}</h3>
          <table className="ruled">
            <thead>
              <tr>
                <th scope="col">{ui.mun.columns.programme}</th>
                <th scope="col">{ui.mun.columns.bodyOrResult}</th>
                <th scope="col">{ui.mun.columns.year}</th>
              </tr>
            </thead>
            <tbody>
              {mun.parliamentary.map((p) => (
                <tr key={p.name} className="hov">
                  <td className="c-subj">{p.name}</td>
                  <td className="c-sm">{p.result ?? ("body" in p ? p.body : "")}</td>
                  <td className="c-year">{p.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Run>
      </MunProvider>
    </Chapter>
  );
}
