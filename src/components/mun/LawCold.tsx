import { site } from "@/content/site";
import { destinationFigure, PAGES } from "@/lib/pages";
import { Recede } from "@/components/Recede";
import { SEATS } from "./seats";

/** Plan box (metres) for the drawing: the chamber seen from above, dais at the top. */
const VB = { x: -5.6, y: -2.6, w: 11.2, h: 8.4 };

function arc(r: number, half: number) {
  const p = (a: number) => `${(Math.sin(a) * r).toFixed(3)} ${(Math.cos(a) * r).toFixed(3)}`;
  return `M ${p(-half)} A ${r} ${r} 0 0 0 ${p(half)}`;
}

/**
 * The Law & Diplomacy cold open, made without footage (site.media.m3 is pending): the chamber
 * drawn as a plan from the real seats, one mark per placard. The rails draw in, the floor marks
 * come up in order, and the three dais marks take the brass light, foreshadowing the set piece
 * below. Transform and opacity only; under reduced motion it is simply drawn.
 */
export function LawCold() {
  const page = PAGES.modelUn;
  const fig = destinationFigure(page.id);
  const floor = SEATS.filter((s) => s.kind === "floor");
  return (
    <section className="cold cold--law" aria-labelledby="page-title">
      <div className="law-plan" aria-hidden="true">
        <svg className="law-plan__svg" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="law-pool" cx="0" cy="-0.8" r="2.6" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.32" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="law-plan__pool" cx="0" cy="-0.8" r="2.6" fill="url(#law-pool)" />
          {[2.6, 3.9, 5.4].map((r, i) => (
            <path key={r} d={arc(r, 1.15)} className="law-plan__ring" style={{ animationDelay: `${200 + i * 140}ms` }} pathLength={1} />
          ))}
          <rect x={-1.95} y={-2.1} width={3.9} height={2.5} className="law-plan__dais" />
          <line x1={-1.95} x2={1.95} y1={0.4} y2={0.4} className="law-plan__rail" pathLength={1} />
          {SEATS.map((s) => {
            const deg = (-(s.face + Math.PI) * 180) / Math.PI;
            const order = s.kind === "floor" ? floor.indexOf(s) : 0;
            const delay = s.kind === "dais" ? 1500 : s.kind === "bench" ? 1350 : 700 + order * 38;
            return (
              <g key={s.id} transform={`translate(${s.x} ${s.z}) rotate(${deg})`}>
                <rect
                  x={s.kind === "dais" ? -0.4 : -0.33}
                  y={-0.15}
                  width={s.kind === "dais" ? 0.8 : 0.66}
                  height={0.3}
                  className={`law-plan__seat law-plan__seat--${s.kind}`}
                  style={{ animationDelay: `${delay}ms`, ["--o" as string]: String(0.3 + 0.6 * s.glow) }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <Recede />
      <div className="cold__copy">
        <h1 id="page-title" className="display-xl cold__title">
          {site.ui.pages.modelUn}
        </h1>
        <p className="cold--law__descriptor">{site.lawDiplomacy.descriptor}</p>
        {fig ? (
          <p className="cold__stat">
            <span className="cold__figure">{fig.value}</span>
            <span className="cold__label">{fig.note}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
