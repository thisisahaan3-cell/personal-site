"use client";

import { site } from "@/content/site";
import { Readout } from "./Readout";
import { matches, SEATS, type Filter } from "./seats";

const ui = site.ui.modelUn;

/** The view: x −5.6..5.6 m, z −2.4..5.6 m (dais at the top, delegates below, the bench at the right). */
const VB = { x: -5.6, z: -2.4, w: 11.2, h: 8 };
const pctX = (x: number) => ((x - VB.x) / VB.w) * 100;
const pctY = (z: number) => ((z - VB.z) / VB.h) * 100;

function arc(r: number, span: number) {
  const a0 = -span / 2;
  const a1 = span / 2;
  const p = (a: number) => `${(Math.sin(a) * r).toFixed(3)} ${(Math.cos(a) * r).toFixed(3)}`;
  return `M ${p(a0)} A ${r} ${r} 0 0 0 ${p(a1)}`;
}

/**
 * The chamber as a plan (phone, reduced motion, no WebGL): the same seats, tappable, with the
 * same readout. Real buttons sit over the drawing; the SVG itself is decorative.
 */
export function PlanView({
  filter,
  active,
  onSelect,
}: {
  filter: Filter;
  active: string | null;
  onSelect: (id: string) => void;
}) {
  const seat = active ? SEATS.find((s) => s.id === active) : null;
  return (
    <div className="plan">
      <div className="plan__drawing">
        <svg viewBox={`${VB.x} ${VB.z} ${VB.w} ${VB.h}`} aria-hidden="true" className="plan__svg">
          {[2.6, 3.9, 5.4].map((r) => (
            <path key={r} d={arc(r, 2.3)} className="plan__ring" />
          ))}
          <rect x={-1.9} y={-2.1} width={3.8} height={2.4} className="plan__dais" />
          {SEATS.filter((s) => s.kind === "bench").length ? <rect x={3.8} y={-0.8} width={0.6} height={1.9} className="plan__bench" /> : null}
          {SEATS.map((s) => {
            const lit = matches(s, filter);
            const deg = (-(s.face + Math.PI) * 180) / Math.PI;
            return (
              <g key={s.id} transform={`translate(${s.x} ${s.z}) rotate(${deg})`}>
                <rect
                  x={s.kind === "dais" ? -0.38 : -0.32}
                  y={-0.14}
                  width={s.kind === "dais" ? 0.76 : 0.64}
                  height={0.28}
                  className="plan__seat-mark"
                  data-active={active === s.id ? "" : undefined}
                  style={{ opacity: (lit ? 1 : 0.18) * (0.35 + 0.65 * s.glow) }}
                />
              </g>
            );
          })}
        </svg>
        {SEATS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="plan__seat"
            style={{ left: `${pctX(s.x)}%`, top: `${pctY(s.z)}%` }}
            aria-label={s.label}
            aria-pressed={active === s.id}
            data-dim={matches(s, filter) ? undefined : ""}
            onClick={() => onSelect(s.id)}
          />
        ))}
      </div>
      <div className="plan__readout" aria-live="polite">
        {seat ? <Readout seat={seat} /> : <span className="plan__hint">{ui.hintPlan}</span>}
      </div>
    </div>
  );
}
