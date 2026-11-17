"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { organisations, site } from "@/content/site";
import { fill, tileFor } from "@/lib/content";
import { useReducedMotion } from "@/lib/motion";
import { AXIS_FROM, AXIS_TO, ENTRIES, LANES, ROWS, YEARS, type Entry } from "./stints";

/**
 * "Stints" (direction §5, Leadership): a race-strategy chart of every dated entry, 2013 to 2026.
 * A playhead sweeps across on entry and the bars draw in as it passes. Drag the playhead, tap a bar
 * or use the arrow keys (on the playhead) to open an entry, exactly as written. The site's timeline.
 */

const ui = site.ui.leadership;
const N = ENTRIES.length;
const ROW_H = 24;
const BAR_H = 14;
const LANE_PAD = 10;
const AXIS_H = 34;
const LABEL_W = 200;
const PHONE_YEAR_W = 84;

type Layout = { phone: boolean; plotW: number; laneY: Record<string, number>; height: number };

function layout(width: number): Layout {
  const phone = width < 760;
  const plotW = phone ? PHONE_YEAR_W * YEARS.length : width - LABEL_W;
  const laneY: Record<string, number> = {};
  let y = AXIS_H;
  for (const l of LANES) {
    laneY[l] = y;
    y += ROWS[l] * ROW_H + LANE_PAD * 2 + (phone ? 18 : 0);
  }
  return { phone, plotW, laneY, height: y + 8 };
}

/** A bar drawn to fraction k; its label appears once the bar is complete. */
function reveal(g: SVGGElement | null, k: number) {
  if (!g) return;
  g.style.transform = `scaleX(${k})`;
  g.style.opacity = k > 0 ? "1" : "0";
  const label = g.nextElementSibling as SVGElement | null;
  if (label) label.style.opacity = k >= 0.98 ? "1" : "0";
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function Stints() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const chart = useRef<HTMLDivElement>(null);
  const plot = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const bars = useRef<(SVGGElement | null)[]>([]);
  const [lay, setLay] = useState<Layout | null>(null);
  const layRef = useRef<Layout | null>(null);
  const [current, setCurrent] = useState(N - 1);
  const [swept, setSwept] = useState(false);
  const tRef = useRef(AXIS_TO);
  const sweptRef = useRef(false);
  useEffect(() => {
    sweptRef.current = swept;
  }, [swept]);

  const x = useCallback((t: number) => {
    const L = layRef.current;
    return L ? ((t - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * L.plotW : 0;
  }, []);

  /** Draw the playhead and the bars' reveal for axis time t (transform and opacity only). */
  const paint = useCallback(
    (t: number) => {
      tRef.current = t;
      const px = x(Math.min(t, AXIS_TO));
      if (head.current) head.current.style.transform = `translate3d(${px}px, 0, 0)`;
      if (readout.current) readout.current.textContent = String(Math.min(AXIS_TO - 1, Math.floor(t)));
      ENTRIES.forEach((e, i) => {
        const g = bars.current[i];
        if (!g) return;
        if (sweptRef.current) return reveal(g, 1);
        reveal(g, Math.max(0, Math.min(1, (t - e.from) / (e.to - e.from))));
      });
    },
    [x],
  );

  // Measure.
  useEffect(() => {
    const el = chart.current;
    if (!el) return;
    const measure = () => {
      const L = layout(el.clientWidth);
      const p = layRef.current;
      if (p && p.plotW === L.plotW && p.phone === L.phone) return;
      layRef.current = L;
      setLay(L);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the drawing in step with layout changes.
  useEffect(() => {
    if (!lay) return;
    paint(tRef.current);
  }, [lay, paint]);

  // The sweep: once, when the chart comes into view. Reduced motion: drawn and settled.
  useEffect(() => {
    if (reduced || !lay) return;
    const el = chart.current;
    if (!el || swept) return;
    paint(AXIS_FROM);
    let raf = 0;
    let start = 0;
    const DUR = 3600;
    const run = (now: number) => {
      if (!start) start = now;
      const u = Math.min(1, (now - start) / DUR);
      paint(AXIS_FROM + ease(u) * (ENTRIES[N - 1].anchor - AXIS_FROM));
      if (u < 1 && !document.hidden) raf = requestAnimationFrame(run);
      else {
        paint(ENTRIES[N - 1].anchor);
        setSwept(true);
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !raf) {
          raf = requestAnimationFrame(run);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced, lay, swept, paint]);

  const select = useCallback(
    (i: number, snap = true) => {
      const k = Math.max(0, Math.min(N - 1, i));
      setCurrent(k);
      setSwept(true);
      if (snap) {
        // Bring the playhead to the entry; every bar it passes stays drawn.
        paint(ENTRIES[k].anchor);
        // Once chosen, every bar stays drawn.
        ENTRIES.forEach((_, j) => reveal(bars.current[j], 1));
      }
      // On phone, keep the chosen bar in view.
      const L = layRef.current;
      const sc = plot.current?.parentElement;
      if (L?.phone && sc) {
        const px = x(ENTRIES[k].anchor);
        if (px < sc.scrollLeft + 40 || px > sc.scrollLeft + sc.clientWidth - 40)
          sc.scrollTo({ left: px - sc.clientWidth / 2, behavior: reduced ? "instant" : "smooth" });
      }
    },
    [paint, x, reduced],
  );

  // Drag the playhead (or press on the plot) to scrub; release snaps to the nearest entry.
  useEffect(() => {
    const p = plot.current;
    if (!p || !lay) return;
    let id: number | null = null;
    let moved = false;
    let startX = 0;
    const timeAt = (clientX: number) => {
      const r = p.getBoundingClientRect();
      return AXIS_FROM + ((clientX - r.left) / lay.plotW) * (AXIS_TO - AXIS_FROM);
    };
    const nearest = (t: number) => {
      let best = 0;
      ENTRIES.forEach((e, i) => {
        if (Math.abs(e.anchor - t) < Math.abs(ENTRIES[best].anchor - t)) best = i;
      });
      return best;
    };
    const down = (e: PointerEvent) => {
      const onHandle = (e.target as HTMLElement).closest(".stints__handle");
      // On touch, only the handle scrubs; elsewhere the finger scrolls the chart.
      if (e.pointerType !== "mouse" && !onHandle) return;
      if (e.button > 0) return;
      id = e.pointerId;
      moved = false;
      startX = e.clientX;
      p.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      if (!moved && Math.abs(e.clientX - startX) < 4) return;
      moved = true;
      p.dataset.dragging = "";
      const t = Math.max(AXIS_FROM, Math.min(AXIS_TO, timeAt(e.clientX)));
      paint(t);
      setSwept(true);
      setCurrent(nearest(t));
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      delete p.dataset.dragging;
      if (moved) select(nearest(timeAt(e.clientX)));
    };
    p.addEventListener("pointerdown", down);
    p.addEventListener("pointermove", move);
    p.addEventListener("pointerup", up);
    p.addEventListener("pointercancel", up);
    return () => {
      p.removeEventListener("pointerdown", down);
      p.removeEventListener("pointermove", move);
      p.removeEventListener("pointerup", up);
      p.removeEventListener("pointercancel", up);
    };
  }, [lay, paint, select]);

  const onKey = (e: React.KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step) {
      e.preventDefault();
      select(current + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(0);
    } else if (e.key === "End") {
      e.preventDefault();
      select(N - 1);
    }
  };

  const entry = ENTRIES[current];
  const org = tileFor(entry.ev.org, entry.ev.title);

  return (
    <section ref={section} className={reduced ? "stints stints--static" : "stints"} aria-labelledby="stints-title">
      <div className="stints__stage">
        <header className="stints__head">
          <h2 id="stints-title" className="heading">
            {ui.stintsHeading}
          </h2>
          <p className="stints__intro">
            <span className="stints__intro-wide">{ui.stintsIntro}</span>
            <span className="stints__intro-phone">{ui.stintsIntroPhone}</span>
          </p>
          <ul className="stints__legend" aria-hidden="true">
            <li>
              <span className="legend legend--soft" />
              {ui.legendYear}
            </li>
            <li>
              <span className="legend legend--hard" />
              {ui.legendMonth}
            </li>
            <li>
              <span className="legend legend--present" />
              {ui.legendPresent}
            </li>
          </ul>
        </header>

        <div className="stints__chart" ref={chart} style={lay ? { height: lay.height } : undefined}>
          {lay ? (
            <>
              <ul className="stints__lanes" aria-hidden="true">
                {LANES.map((l) => (
                  <li key={l} style={{ transform: `translate3d(0, ${lay.laneY[l] + (lay.phone ? 2 : LANE_PAD + 4)}px, 0)` }}>
                    {ui.lanes[l]}
                  </li>
                ))}
              </ul>
              <div className="stints__scroll">
                <div className="stints__plot" ref={plot} style={{ width: lay.plotW, height: lay.height }}>
                  <Chart lay={lay} bars={bars} current={current} onPick={(i) => select(i)} />
                  <div className="stints__head-line" ref={head}>
                    <span className="stints__readout" ref={readout} aria-hidden="true">
                      {AXIS_TO - 1}
                    </span>
                    <span className="stints__line" aria-hidden="true" />
                    <div
                      className="stints__handle"
                      ref={handle}
                      role="slider"
                      tabIndex={0}
                      aria-label={ui.playheadLabel}
                      aria-valuemin={1}
                      aria-valuemax={N}
                      aria-valuenow={current + 1}
                      aria-valuetext={`${entry.when}: ${entry.ev.title}`}
                      onKeyDown={onKey}
                    >
                      <span className="stints__grip" />
                    </div>
                  </div>
                  {YEARS.map((y) => (
                    <span key={y} className="stints__snap" style={{ left: ((y - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * lay.plotW }} aria-hidden="true" />
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="stints__panel" aria-live="polite">
          <div className="stints__entry" key={entry.id} data-swept={swept ? "" : undefined}>
            <p className="stints__meta">
              <span className="stints__when">{entry.when}</span>
              <span className="stints__lane">{ui.lanes[entry.lane]}</span>
              <span className="stints__count">{fill(ui.entryCounter, { n: current + 1, total: N })}</span>
            </p>
            <h3 className="stints__title">{entry.ev.title}</h3>
            <p className="stints__detail">{entry.ev.detail}</p>
            {org ? <OrgName org={org} /> : null}
          </div>
          <div className="stints__nav">
            <button type="button" className="stints__step" onClick={() => select(current - 1)} disabled={current === 0}>
              {ui.earlier}
            </button>
            <button type="button" className="stints__step" onClick={() => select(current + 1)} disabled={current === N - 1}>
              {ui.later}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrgName({ org }: { org: string }) {
  const o = organisations[org]?.name;
  return o ? <p className="stints__org">{o}</p> : null;
}

/** The SVG: year grid, lanes, bars (soft or square ends, rings for the Scholar Badge). */
function Chart({
  lay,
  bars,
  current,
  onPick,
}: {
  lay: Layout;
  bars: React.RefObject<(SVGGElement | null)[]>;
  current: number;
  onPick: (i: number) => void;
}) {
  const W = lay.plotW;
  const X = (t: number) => ((t - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * W;
  const grid = useMemo(
    () => (
      <g aria-hidden="true">
        {YEARS.map((y) => (
          <g key={y}>
            <line x1={X(y)} x2={X(y)} y1={AXIS_H - 6} y2={lay.height} className="s-grid" />
            <text x={X(y + 0.5)} y={18} textAnchor="middle" className="s-year">
              {y}
            </text>
          </g>
        ))}
        <line x1={W} x2={W} y1={AXIS_H - 6} y2={lay.height} className="s-grid" />
        {LANES.map((l) => (
          <line key={l} x1={0} x2={W} y1={lay.laneY[l]} y2={lay.laneY[l]} className="s-lane" />
        ))}
      </g>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, lay],
  );
  return (
    <svg className="stints__svg" width={W} height={lay.height} viewBox={`0 0 ${W} ${lay.height}`}>
      {grid}
      {ENTRIES.map((e, i) => {
        const x0 = X(e.from);
        const x1 = X(e.to);
        const y = lay.laneY[e.lane] + LANE_PAD + (lay.phone ? 18 : 0) + e.row * ROW_H + (ROW_H - BAR_H) / 2;
        const w = x1 - x0;
        const s = e.soft ? Math.min(12, w * 0.18) : 0;
        const sel = i === current;
        const tip = e.present ? 10 : 0;
        const label = w - 2 * s - tip > e.ev.title.length * 6.4 + 16;
        return (
          <g
            key={e.id}
            className="s-bar"
            data-sel={sel ? "" : undefined}
            data-soft={e.soft ? "" : undefined}
            onClick={() => onPick(i)}
          >
            <rect x={x0 - 2} y={y - 5} width={w + 4} height={BAR_H + 10} className="s-hit" />
            <g
              ref={(el) => {
                bars.current[i] = el;
              }}
              className="s-draw"
            >
              {e.soft ? (
                <>
                  {[0.55, 0.3, 0.12].map((o, k) => (
                    <rect key={`a${k}`} x={x0 + s - ((k + 1) * s) / 3} y={y} width={s / 3} height={BAR_H} className="s-body" opacity={o} />
                  ))}
                  {[0.55, 0.3, 0.12].map((o, k) => (
                    <rect key={`b${k}`} x={x1 - s + (k * s) / 3 - tip} y={y} width={s / 3} height={BAR_H} className="s-body" opacity={e.present ? 0 : o} />
                  ))}
                </>
              ) : (
                <>
                  <rect x={x0} y={y - 4} width={1.5} height={BAR_H + 8} className="s-cap" />
                  <rect x={x1 - 1.5} y={y - 4} width={1.5} height={BAR_H + 8} className="s-cap" />
                </>
              )}
              <rect x={x0 + s} y={y} width={Math.max(1, w - 2 * s - tip)} height={BAR_H} className="s-body" />
              {e.present ? <path d={`M ${x1 - tip} ${y} L ${x1} ${y + BAR_H / 2} L ${x1 - tip} ${y + BAR_H} Z`} className="s-body" /> : null}
              {e.rings.map((r) => (
                <circle key={r} cx={X(r)} cy={y + BAR_H / 2} r={4} className="s-ring" />
              ))}
            </g>
            {label ? (
              <text x={x0 + s + 8} y={y + BAR_H / 2} dominantBaseline="central" className="s-label">
                {e.ev.title}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
