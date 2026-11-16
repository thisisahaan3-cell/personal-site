import { site } from "@/content/site";
import { interest, stat } from "@/lib/content";
import { Chapter, ChapterHead, EditableText, LogoTile, Run } from "../primitives";
import { Globe, MunProvider, Placard, Record, Tally } from "./MunClient";

const ui = site.ui;
const mun = site.mun;

export function Mun() {
  const summary = [stat("conferences"), stat("awardsSummary"), stat("delegateAwards")];
  return (
    <Chapter id="mun" className="clip-x">
      <MunProvider>
        <ChapterHead id="mun" />
        <Run className="pb-fig">
          <div className="mun-summary">
            {summary.map((s) => (
              <div key={s.id}>
                <p className="t-title">{s.value}</p>
                <p className="t-small fg2" style={{ marginTop: 8 }}>
                  {s.label}
                  {s.note && (
                    <>
                      <br />
                      {s.note}
                    </>
                  )}
                </p>
              </div>
            ))}
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
              {mun.executiveBoard.map((b) => (
                <tr key={b.conference} className="hov">
                  <td className="c-subj">{b.conference}</td>
                  <td className="c-sm">{b.role}</td>
                  <td className="c-sm">{b.committee}</td>
                  <td className="c-year">{b.year ?? ""}</td>
                  <td className="c-logo">{"org" in b && <LogoTile org={b.org} />}</td>
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
