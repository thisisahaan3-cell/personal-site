"use client";

import { useRef, useState } from "react";
import { site } from "@/content/site";
import { fill } from "@/lib/content";
import { useMotion } from "../motion/MotionProvider";
import { FigureBox, FLabel, Svg, Wipe } from "../primitives";

const F = site.ui.competitions.financeFigure;
const fmt = (n: number) => n.toLocaleString("en-GB");

function ordinal(n: number) {
  const s = F.ordinalSuffixes;
  const t = n % 100;
  if (t >= 11 && t <= 13) return s.other;
  return n % 10 === 1 ? s.one : n % 10 === 2 ? s.two : n % 10 === 3 ? s.few : s.other;
}

type Geo = {
  W: number;
  H: number;
  x0: number;
  x1: number;
  up: number;
  lo: number;
  f: number;
  r: number;
  rise: number;
  riseW: number;
  dot: number;
  ticks: boolean;
};
const DESK: Geo = { W: 1110, H: 320, x0: 90, x1: 1050, up: 100, lo: 220, f: 24, r: 60, rise: 28, riseW: 48, dot: 95, ticks: true };
const PHONE: Geo = { W: 350, H: 300, x0: 28, x1: 326, up: 90, lo: 210, f: 16, r: 60, rise: 20, riseW: 15, dot: 30, ticks: false };

const RUNS = [
  { total: 10000, totalText: F.upper.field.split(" ")[0], mark: 54, snap: F.readout.snapUpper },
  { total: 2000, totalText: F.lower.field.split(" ")[0], mark: 100, snap: F.readout.snapLower },
];

function Drawing({ g, variant }: { g: Geo; variant: "desk" | "phone" }) {
  const { W, H, x0, x1, up, lo, f, r, rise, riseW, dot } = g;
  const span = x1 - x0;
  const upper = `M 0 0 L 0 ${up - f} A ${f} ${f} 0 0 0 ${f} ${up} L ${x1} ${up} A ${r} ${r} 0 0 1 ${x1} ${lo}`;
  const lower = `M ${x1} ${lo} L ${x0 + riseW} ${lo} L ${x0 + riseW} ${lo - rise} L ${x0} ${lo - rise} L ${x0} ${lo} L ${f} ${lo} A ${f} ${f} 0 0 0 0 ${lo + f} L 0 ${H}`;
  const ticks = (y: number) =>
    Array.from({ length: 11 }, (_, k) => {
      const end = k === 0 || k === 10;
      if (!g.ticks && !end) return null;
      const x = x0 + (span * k) / 10;
      return <line key={k} className="hl" x1={x} x2={x} y1={y + 3} y2={y + 3 + (end ? 16 : 10)} />;
    });
  const desk = variant === "desk";
  return (
    <>
      <Svg w={W} h={H} fade>
        <rect x={x0} y={lo - rise} width={riseW} height={rise} fill="var(--color-sky)" />
        {ticks(up)}
        {ticks(lo)}
      </Svg>
      <Wipe axis="x" from={0} to={0.5}>
        <Svg w={W} h={H}>
          <path className="ln" d={upper} />
        </Svg>
      </Wipe>
      <Wipe axis="-x" from={0.5} to={1}>
        <Svg w={W} h={H}>
          <path className="ln" d={lower} />
        </Svg>
      </Wipe>
      <span className="mark-dot" style={{ left: `${(dot / W) * 100}%`, top: `${(up / H) * 100}%` }} data-at={0.05} />

      <FLabel x={x0} y={up - 12} w={W} h={H} valign="bottom" at={0.05} className="t-title2 fin-num">
        {F.upper.value}
      </FLabel>
      <FLabel x={x0 + (desk ? 70 : 44)} y={up - 16} w={W} h={H} valign="bottom" at={0.1} className="t-data fg2">
        {F.upper.note}
      </FLabel>
      <FLabel
        x={x1}
        y={desk ? up - 16 : up + 8}
        w={W}
        h={H}
        align="right"
        valign={desk ? "bottom" : "top"}
        at={0.45}
        className="t-data fg2"
      >
        {F.upper.field}
      </FLabel>
      <FLabel x={x0} y={up + (desk ? 22 : 26)} w={W} h={H} at={0.1} className="t-label fin-cap">
        {F.upper.caption}
      </FLabel>

      <FLabel x={x0 + riseW + 12} y={lo - 6} w={W} h={H} valign="bottom" at={0.95} className="t-title2 fin-num">
        {F.lower.value}
      </FLabel>
      <FLabel
        x={x0 + riseW + (desk ? 90 : 62)}
        y={lo - 10}
        w={W}
        h={H}
        valign="bottom"
        at={0.95}
        className="t-data fg2"
      >
        {F.lower.note}
      </FLabel>
      <FLabel
        x={x1}
        y={desk ? lo - 10 : lo + 8}
        w={W}
        h={H}
        align="right"
        valign={desk ? "bottom" : "top"}
        at={0.55}
        className="t-data fg2"
      >
        {F.lower.field}
      </FLabel>
      <FLabel x={x0} y={lo + (desk ? 22 : 26)} w={W} h={H} at={0.95} className="t-label fin-cap">
        {F.lower.caption}
      </FLabel>
    </>
  );
}

/** Figure 3: two fields, with a crosshair that reads the place under the pointer (§3.6). */
export function FinanceFigure() {
  const { fine } = useMotion();
  const [cross, setCross] = useState<{ v: "desk" | "phone"; x: number; y: number; text: string } | null>(null);
  const boxes = useRef<Record<string, HTMLDivElement | null>>({});

  const read = (variant: "desk" | "phone", e: React.PointerEvent) => {
    const box = boxes.current[variant];
    if (!box) return;
    const g = variant === "desk" ? DESK : PHONE;
    const rect = box.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * g.W;
    const vy = ((e.clientY - rect.top) / rect.height) * g.H;
    const run = Math.abs(vy - g.up) < 40 ? 0 : Math.abs(vy - g.lo) < 40 ? 1 : -1;
    if (run < 0 || vx < g.x0 - 6 || vx > g.x1 + 6) {
      setCross(null);
      return;
    }
    const R = RUNS[run];
    const t = Math.min(1, Math.max(0, (vx - g.x0) / (g.x1 - g.x0)));
    const markX = run === 0 ? g.dot : g.x0 + g.riseW;
    const snapped = Math.abs(vx - markX) * (rect.width / g.W) <= 12;
    const place = Math.max(1, Math.round(t * R.total));
    const text = snapped ? R.snap : fill(F.readout.place, { n: fmt(place), suffix: ordinal(place), total: R.totalText });
    const x = snapped ? markX : g.x0 + t * (g.x1 - g.x0);
    setCross({ v: variant, x: (x / g.W) * rect.width, y: ((run === 0 ? g.up : g.lo) / g.H) * rect.height, text });
  };

  const handlers = (variant: "desk" | "phone") => ({
    onPointerMove: (e: React.PointerEvent) => {
      if (fine && e.pointerType === "mouse") read(variant, e);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setCross(null);
    },
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") read(variant, e);
    },
  });

  return (
    <>
      {(["desk", "phone"] as const).map((v) => (
        <div
          key={v}
          className={`fin-wrap fin-${v}`}
          ref={(el) => {
            boxes.current[v] = el;
          }}
          {...handlers(v)}
        >
          <FigureBox w={v === "desk" ? DESK.W : PHONE.W} h={v === "desk" ? DESK.H : PHONE.H} variant="both" className="fin-fig">
            <Drawing g={v === "desk" ? DESK : PHONE} variant={v} />
          </FigureBox>
          {cross?.v === v && (
            <span className="fin-cross" style={{ transform: `translate(${cross.x}px, ${cross.y}px)` }} aria-hidden="true">
              <i />
              <i />
              <span className="t-data">{cross.text}</span>
            </span>
          )}
        </div>
      ))}
    </>
  );
}
