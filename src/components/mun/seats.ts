import { site, type AwardLevel } from "@/content/site";
import { fill } from "@/lib/content";

/**
 * The chamber's seats (direction §5). Only real seats exist: one placard per award on the floor,
 * one per Executive Board role on the dais, one per parliamentary programme on the side bench.
 * Coordinates are metres in a plan where the dais front is at z = 0 and delegates sit on arcs
 * toward +z. The 3D scene and the phone's SVG plan both read this.
 */

export type SeatKind = "floor" | "dais" | "bench";
export type Seat = {
  id: string;
  kind: SeatKind;
  /** Plan position (x, z), tier height y, facing angle (radians, 0 = facing +z). */
  x: number;
  z: number;
  y: number;
  face: number;
  /** Placard face text (short) and the full readout. */
  title: string;
  sub: string;
  lines: string[];
  label: string;
  year: number | null;
  level: AwardLevel | null;
  /** 0..1: placard brightness. */
  glow: number;
};

export const LEVELS: AwardLevel[] = [
  "Best Delegate",
  "High Commendation",
  "Runner Up",
  "Special Mention",
  "Honourable Mention",
  "Verbal Mention",
];
const GLOW: Record<AwardLevel, number> = {
  "Best Delegate": 1,
  "High Commendation": 0.8,
  "Runner Up": 0.7,
  "Special Mention": 0.61,
  "Honourable Mention": 0.53,
  "Verbal Mention": 0.46,
};

const mun = site.mun;
const ui = site.ui.modelUn;

export const AWARDS = mun.awards;
export const AWARD_COUNT = AWARDS.length;
export const BEST_COUNT = AWARDS.filter((a) => a.level === "Best Delegate").length;
export const HEADLINE = fill(ui.headline, { n: AWARD_COUNT, best: BEST_COUNT });

/** Arcs: the inner row takes the first awards (resume order), the outer row the rest. */
function floorSeats(): Seat[] {
  const n = AWARDS.length;
  const inner = Math.min(7, Math.floor(n / 2));
  const rows = [
    { r: 4.4, y: 0.0, span: 1.05, count: inner },
    { r: 6.5, y: 0.34, span: 1.12, count: n - inner },
  ];
  const out: Seat[] = [];
  let i = 0;
  for (const row of rows) {
    for (let k = 0; k < row.count; k++, i++) {
      const a = AWARDS[i];
      const t = row.count === 1 ? 0 : k / (row.count - 1) - 0.5;
      const th = t * 2 * row.span;
      const parts = [a.conference, a.committee, a.award, String(a.year)];
      out.push({
        id: `award-${i}`,
        kind: "floor",
        x: Math.sin(th) * row.r,
        z: Math.cos(th) * row.r,
        y: row.y,
        face: th + Math.PI,
        title: a.conference,
        sub: a.committee,
        lines: [
          a.conferenceFull ? `${a.conference} (${a.conferenceFull})` : a.conference,
          a.committeeFull ? `${a.committee} (${a.committeeFull})` : a.committee,
          a.award,
          String(a.year),
        ],
        label: parts.join(", "),
        year: a.year,
        level: a.level,
        glow: GLOW[a.level],
      });
    }
  }
  return out;
}

function daisSeats(): Seat[] {
  const n = mun.executiveBoard.length;
  return mun.executiveBoard.map((e, i) => {
    const x = (i - (n - 1) / 2) * 1.7;
    const lines = [e.conference, e.committee, e.role];
    if (e.year) lines.push(String(e.year));
    return {
      id: `board-${i}`,
      kind: "dais" as const,
      x,
      z: -0.9,
      y: 0.62,
      face: 0,
      title: e.conference,
      sub: e.committee,
      lines,
      label: [ui.dais, ...lines].join(", "),
      year: e.year,
      level: null,
      glow: 0.9,
    };
  });
}

function benchSeats(): Seat[] {
  const n = mun.parliamentary.length;
  return mun.parliamentary.map((p, i) => {
    const lines = [p.name];
    if ("body" in p && p.body) lines.push(p.body);
    if (p.result) lines.push(p.result);
    lines.push(String(p.year));
    return {
      id: `bench-${i}`,
      kind: "bench" as const,
      x: 6.4,
      z: -0.2 + (i - (n - 1) / 2) * 1.5,
      y: 0.2,
      face: -Math.PI / 2,
      title: p.name.replace(/\s\d{4}$/, ""),
      sub: String(p.year),
      lines,
      label: [ui.bench, ...lines].join(", "),
      year: p.year,
      level: null,
      glow: 0.7,
    };
  });
}

export const SEATS: Seat[] = [...floorSeats(), ...daisSeats(), ...benchSeats()];

export const YEARS = Array.from(new Set(AWARDS.map((a) => a.year))).sort((a, b) => b - a);
export const PRESENT_LEVELS = LEVELS.filter((l) => AWARDS.some((a) => a.level === l));

export type Filter = { kind: "all" } | { kind: "year"; year: number } | { kind: "level"; level: AwardLevel };
export const filterKey = (f: Filter) => (f.kind === "all" ? "all" : f.kind === "year" ? `year:${f.year}` : `level:${f.level}`);

/** Year filters light every seat of that year; award filters light only the matching awards. */
export function matches(seat: Seat, f: Filter) {
  if (f.kind === "all") return true;
  if (f.kind === "year") return seat.year === f.year;
  return seat.level === f.level;
}
