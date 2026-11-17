import Image from "next/image";
import { organisations, site } from "@/content/site";
import { resolveMedia } from "@/lib/media.server";

const mun = site.mun;
const ui = site.ui;

/** Awards newest first; within a year, resume order. */
const BY_YEAR = [...mun.awards].map((a, i) => ({ a, i })).sort((x, y) => y.a.year - x.a.year || x.i - y.i);

/**
 * The record set as a docket (direction §6, law): Bodoni entries on hairline rules, the year in
 * the margin, over the graded chamber still (M4) held in place while the list passes.
 */
export function Docket() {
  const still = resolveMedia("m4").poster;
  const iitd = organisations.iitDelhi;
  return (
    <section className="docket" aria-labelledby="docket-title">
      <div className="docket__backdrop" aria-hidden="true">
        <div className="docket__still footage">
          {still ? <Image className="footage__media" src={still} alt="" fill sizes="100vw" /> : null}
          <div className="footage__grade" />
        </div>
      </div>

      <div className="docket__body">
        <h2 id="docket-title" className="display-l docket__title">
          {ui.modelUn.docketHeading}
        </h2>

        <h3 className="heading docket__sub">{ui.mun.awardsHeading}</h3>
        <ol className="docket__list">
          {BY_YEAR.map(({ a, i }, k) => {
            const first = k === 0 || BY_YEAR[k - 1].a.year !== a.year;
            return (
              <li key={i} className="docket__row" data-first={first ? "" : undefined} data-level={a.level}>
                <span className="docket__margin">{first ? a.year : null}</span>
                <span className="docket__conf">
                  {a.conference}
                  {a.conferenceFull ? <span className="docket__full">{a.conferenceFull}</span> : null}
                </span>
                <span className="docket__committee">
                  {a.committee}
                  {a.committeeFull ? <span className="docket__full">{a.committeeFull}</span> : null}
                </span>
                <span className="docket__award">{a.award}</span>
              </li>
            );
          })}
        </ol>

        <div className="docket__pair">
          <div>
            <h3 className="heading docket__sub">{ui.mun.executiveBoardHeading}</h3>
            <ul className="docket__list docket__list--short">
              {mun.executiveBoard.map((e) => (
                <li key={e.conference} className="docket__row docket__row--short">
                  <span className="docket__margin">{e.year ?? ""}</span>
                  <span className="docket__conf">
                    {e.conference}
                    <span className="docket__full">
                      {e.role}, {e.committee}
                    </span>
                  </span>
                  {e.org === "iitDelhi" && iitd.logo ? (
                    <span className="docket__logo">
                      <Image src={iitd.logo} alt={iitd.name} width={28} height={28} />
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="heading docket__sub">{ui.mun.parliamentaryHeading}</h3>
            <ul className="docket__list docket__list--short">
              {mun.parliamentary.map((p) => (
                <li key={p.name} className="docket__row docket__row--short">
                  <span className="docket__margin">{p.year}</span>
                  <span className="docket__conf">
                    {p.name}
                    {"body" in p && p.body ? <span className="docket__full">{p.body}</span> : null}
                    {p.result ? <span className="docket__full">{p.result}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
