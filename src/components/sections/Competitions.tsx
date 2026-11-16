import Image from "next/image";
import { site } from "@/content/site";
import { interest, shown, tilesFor } from "@/lib/content";
import { Drift } from "../motion/Drift";
import { Chapter, ChapterHead, Col, EditableText, LogoTile, Placeholder, Run, SerifSafe } from "../primitives";
import { FinanceFigure } from "./FinanceFigure";

const ui = site.ui.competitions;
const slots = site.ui.placeholder.slots;
const artha = site.projects.find((p) => p.id === "artha")!;

export function Competitions() {
  const finance = ui.financeRows;
  const ongoing = site.competitions.filter((c) => c.ongoing);
  const shownInFinance = new Set(["National Finance Olympiad", "SRCC Finance Olympiad"]);
  const further = site.competitions.filter((c) => !c.ongoing && !shownInFinance.has(c.name));
  const financeTiles = tilesFor(finance, (r) => r.org, (r) => r.name);
  const furtherTiles = tilesFor(further, (c) => c.org, (c) => c.name);
  const desc = artha.siteDescriptor!;

  return (
    <Chapter id="competitions" className="clip-x">
      <ChapterHead id="competitions" />
      <Run className="pb-fig">
        <h3 className="t-title2 italic">{ui.financeHeading}</h3>
      </Run>
      <FinanceFigure />

      <Run className="pt-fig pb-block">
        <table className="ruled">
          <thead>
            <tr>
              <th scope="col">{ui.columns.result}</th>
              <th scope="col">{ui.columns.competition}</th>
              <th scope="col">{ui.columns.year}</th>
              <th scope="col" className="c-logo" />
            </tr>
          </thead>
          <tbody>
            {finance.map((r, i) => (
              <tr key={r.id} className="hov">
                <td className="c-subj" style={{ whiteSpace: "nowrap" }}>
                  <SerifSafe text={r.figure} />
                </td>
                <td className="c-sm">
                  <span className="t-label">
                    {r.name}
                    {"stage" in r && r.stage ? `, ${r.stage}` : ""}
                  </span>
                  {r.results.map((x) => (
                    <span key={x} className="block fg2">
                      {x}
                    </span>
                  ))}
                </td>
                <td className="c-year">{shown(r.year)}</td>
                <td className="c-logo">
                  <LogoTile org={financeTiles[i]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Run>

      <Run className="pb-block">
        <div className="grid10">
          <Col d={[3, 8]} t={[1, 4]}>
            <EditableText value={interest("finance").description} slot={slots.finance} />
          </Col>
        </div>
      </Run>

      <Run className="pb-block">
        <h3 className="t-title sub">{ui.artha.heading}</h3>
        <div className="artha">
          <div className="artha-copy">
            <div>
              <p className="t-lead measure">{desc.text}</p>
              <p className="t-data fg2" style={{ marginTop: 12 }}>
                {ui.artha.descriptorNote}
              </p>
            </div>
            <ul className="rlist t-small">
              {desc.sections.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <EditableText value={artha.description} slot={slots.artha} />
            <p style={{ marginTop: 32 }}>
              <a className="btn btn-secondary" href={artha.url} target="_blank" rel="noopener">
                {ui.artha.visit}
              </a>
            </p>
          </div>
          <div className="artha-shots">
            <Drift>
              <Image
                className="artha-desk"
                src="/images/artha-home.webp"
                alt={ui.artha.desktopAlt}
                width={2880}
                height={1800}
                loading="lazy"
                sizes="(min-width: 1100px) 60vw, 100vw"
              />
            </Drift>
            <div className="artha-phone">
              <div className="artha-phone-frame">
                <Image
                  src="/images/artha-home-mobile.webp"
                  alt={ui.artha.mobileAlt}
                  width={780}
                  height={1688}
                  loading="lazy"
                  sizes="240px"
                />
              </div>
            </div>
          </div>
        </div>
      </Run>

      <Run className="pb-block">
        <h3 className="t-title2 sub">{ui.inProgressHeading}</h3>
        <div className="ongoing-pair">
          {ongoing.map((c) => {
            const slot = c.org === "wharton" ? slots.wharton : slots.gitam;
            const details = Object.values(c.details ?? {});
            return (
              <div key={c.name} className="ongoing-item">
                <p className="t-title2">{c.name}</p>
                <p className="t-data fg2">{ui.ongoing}</p>
                <div className="flex items-start justify-between gap-4">
                  <p className="t-body">{c.results.join(" ")}</p>
                  <LogoTile org={c.org} />
                </div>
                {details.some((d) => d.placeholder) ? (
                  <Placeholder slot={slot} compact />
                ) : (
                  details.map((d) => (
                    <p key={d.text} className="t-body measure">
                      {d.text}
                    </p>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </Run>

      <Run className="pb-block">
        <h3 className="t-title2 sub">{ui.furtherHeading}</h3>
        <table className="ruled">
          <thead>
            <tr>
              <th scope="col">{ui.columns.competition}</th>
              <th scope="col">{ui.columns.result}</th>
              <th scope="col">{ui.columns.year}</th>
              <th scope="col" className="c-logo" />
            </tr>
          </thead>
          <tbody>
            {further.map((c, i) => (
              <tr key={c.name} className="hov">
                <td className="c-subj" style={{ maxWidth: 380 }}>
                  {c.name}
                </td>
                <td className="c-sm c-desc">{c.results.join(" ")}</td>
                <td className="c-year">{shown(c.year)}</td>
                <td className="c-logo">
                  <LogoTile org={furtherTiles[i]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Run>

      <Run className="pb-block">
        <div className="grid10">
          <Col d={[3, 10]}>
            <p className="t-small fg2 measure">
              {ui.alsoTookPart} {site.otherCompetitions.join(", ")}.
            </p>
          </Col>
        </div>
      </Run>
    </Chapter>
  );
}
