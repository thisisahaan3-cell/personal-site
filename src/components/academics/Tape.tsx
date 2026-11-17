"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/content/site";
import { fill } from "@/lib/content";
import { useReducedMotion } from "@/lib/motion";
import { Footage } from "@/components/Footage";

/**
 * "The tape" (direction §5, Academics): a cockpit altitude tape over the cloud footage. It rolls up
 * with scroll and settles, with one damped overshoot, on the Grade X figure. A bug sits at the
 * 96%+ floor; six marks show the Scholar Badge years. Only those values are drawn as data: the
 * graduations are a scale. Dragging the tape moves it; it springs back. Phone: horizontal tape.
 */

const ui = site.ui.academics;
const edu = site.education;
const FIGURE = edu.gradeX.score; // "99.4%"
const VALUE = parseFloat(FIGURE);
const floorStat = site.stats.find((s) => s.id === "consistency")!;
const FLOOR_TEXT = floorStat.value; // "96%+"
const FLOOR = parseFloat(FLOOR_TEXT);
const badge = site.timeline.find((t) => t.span?.style === "rings")!;
const BADGE_YEARS = Array.from({ length: badge.span!.to - badge.span!.from + 1 }, (_, i) => badge.span!.from + i);

/** Scale range: 0 to 100 percent, then a hatched stop above 100. */
const VMAX = 104;
const STOP = 100;
/** Furthest the tape may be dragged from its reading. */
const DRAG_RANGE = 5;

type Geo = { horizontal: boolean; W: number; H: number; U: number };

function geometry(w: number, h: number): Geo {
  const horizontal = w < 760;
  return { horizontal, W: w, H: h, U: horizontal ? 44 : Math.round(Math.max(60, Math.min(84, h / 12))) };
}

export function Tape({ video, poster }: { video: string | null; poster: string | null }) {
  const reduced = useReducedMotion();
  return (
    <section className={reduced ? "tape tape--static" : "tape"} aria-labelledby="tape-title">
      <Stage video={video} poster={poster} still={reduced} />
    </section>
  );
}

function Stage({ video, poster, still }: { video: string | null; poster: string | null; still: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const trend = useRef<HTMLDivElement>(null);
  const drums = useRef<(HTMLSpanElement | null)[]>([]);
  const [geo, setGeo] = useState<Geo | null>(null);
  const geoRef = useRef<Geo | null>(null);

  // Physics state lives outside React; React renders only geometry and the landed flag.
  const sim = useRef({
    x: VALUE,
    v: 0,
    target: VALUE,
    mode: "rest" as "rest" | "follow" | "land" | "spring" | "drag",
    landed: true,
    drag: { start: 0, x0: 0, last: 0, lastT: 0 },
  });
  const wake = useRef<() => void>(() => {});

  // Before the stage is reached, the tape waits at zero (only with motion and JS).
  useEffect(() => {
    if (still) return;
    const s = sim.current;
    s.x = 0;
    s.target = 0;
    s.mode = "follow";
    s.landed = false;
  }, [still]);

  // Geometry.
  useEffect(() => {
    const st = stage.current;
    if (!st) return;
    const measure = () => {
      const g = geometry(st.clientWidth, st.clientHeight);
      const prev = geoRef.current;
      if (prev && prev.horizontal === g.horizontal && prev.U === g.U && prev.W === g.W && prev.H === g.H) return;
      geoRef.current = g;
      setGeo(g);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(st);
    return () => ro.disconnect();
  }, []);

  // Render loop: draws the current value; sleeps when nothing moves.
  useEffect(() => {
    if (!geo) return;
    const s = sim.current;
    let raf = 0;
    let last = performance.now();
    let visible = false;

    const draw = () => {
      const g = geoRef.current;
      if (!g) return;
      const { x, v } = s;
      const el = strip.current;
      if (el) {
        el.style.transform = g.horizontal
          ? `translate3d(${g.W / 2 - x * g.U}px, 0, 0)`
          : `translate3d(0, ${g.H / 2 - (VMAX - x) * g.U}px, 0)`;
      }
      // Odometer drums: tenths roll continuously; ones and tens carry during the last tenth.
      const tenths = (((x * 10) % 10) + 10) % 10;
      const ones = Math.floor(x) % 10;
      const carry1 = tenths > 9 ? tenths - 9 : 0;
      const tens = Math.floor(x / 10) % 10;
      const carry2 = ones === 9 ? carry1 : 0;
      const pos = [tens + carry2, ones + carry1, tenths];
      drums.current.forEach((d, i) => {
        if (d) d.style.transform = `translate3d(0, ${-pos[i] * (100 / (i === 2 ? 13 : 11))}%, 0)`;
      });
      // Trend vector: where the reading will be in 0.6s.
      const tr = trend.current;
      if (tr) {
        const span = (g.horizontal ? g.W : g.H) / 2 - 56;
        const len = Math.max(-span, Math.min(span, v * 0.6 * g.U));
        tr.style.transform = g.horizontal ? `scaleX(${len / 100})` : `scaleY(${-len / 100})`;
        tr.style.opacity = Math.abs(len) > 2 ? "1" : "0";
      }
      // The clouds sink as the tape climbs.
      const sk = sky.current;
      if (sk) sk.style.transform = `translate3d(0, ${(x / 100) * 7}%, 0) scale(1.16)`;
    };

    const step = (dt: number) => {
      const T = s.target;
      if (s.mode === "follow") {
        const nx = s.x + (T - s.x) * (1 - Math.exp(-dt / 0.14));
        s.v = (nx - s.x) / Math.max(dt, 1e-3);
        s.x = nx;
        if (T < VALUE && Math.abs(T - s.x) < 0.002) {
          s.x = T;
          s.v = 0;
          s.mode = "rest";
        } else if (T >= VALUE && Math.abs(VALUE - s.x) < 2.2) {
          // Capture: arrive with enough climb to overshoot once, then lock.
          s.mode = "land";
          s.v = Math.max(3.4, Math.min(5, s.v));
        }
      } else if (s.mode === "land" || s.mode === "spring") {
        const w = 2 * Math.PI * (s.mode === "land" ? 0.9 : 1.1);
        const z = s.mode === "land" ? 0.36 : 0.45;
        const a = -w * w * (s.x - T) - 2 * z * w * s.v;
        const v0 = s.v;
        s.v += a * dt;
        s.x += s.v * dt;
        // The reading locks at the top of the overshoot: figure, badges and amber window settle in.
        if (s.mode === "land" && v0 > 0 && s.v <= 0 && T >= VALUE && !s.landed) {
          s.landed = true;
          setLandedAttr(stage.current, true);
        }
        if (Math.abs(s.x - T) < 0.012 && Math.abs(s.v) < 0.06) {
          s.x = T;
          s.v = 0;
          s.mode = "rest";
          if (T >= VALUE && !s.landed) {
            s.landed = true;
            setLandedAttr(stage.current, true);
          }
        }
      } else if (s.mode === "drag") {
        // Position is set by the pointer; velocity decays for the trend vector.
        s.v *= Math.exp(-dt / 0.08);
      }
      s.x = Math.min(STOP - 0.05, Math.max(0, s.x));
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      draw();
      if (s.mode !== "rest" && running()) raf = requestAnimationFrame(frame);
    };
    const running = () => visible && !document.hidden;
    const kick = () => {
      if (!raf && running()) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    wake.current = kick;
    draw();

    const st = stage.current;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    if (st) io.observe(st);
    const onVis = () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0)) : kick());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [geo]);

  // Scroll while pinned sets the target reading.
  useEffect(() => {
    if (still) return;
    const section = stage.current?.parentElement;
    if (!section) return;
    const s = sim.current;
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? -r.top / span : 1;
      const u = Math.max(0, Math.min(1, (p - 0.04) / 0.62));
      // Near the top the tape is captured by its reading, so it never rests on a value it does not hold.
      const raw = VALUE * (1 - (1 - u) * (1 - u));
      const T = raw > VALUE - 1.5 ? VALUE : raw;
      s.target = T;
      if (T < VALUE - 0.01 && s.mode !== "drag") s.mode = "follow";
      else if (T >= VALUE && s.mode === "rest" && Math.abs(s.x - VALUE) > 0.01) s.mode = "follow";
      if (T < VALUE * 0.8 && s.landed) {
        s.landed = false;
        setLandedAttr(stage.current, false);
      }
      wake.current();
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [still, geo]);

  // Drag the tape; it springs back on release. Arrow keys nudge it.
  useEffect(() => {
    const b = band.current;
    if (!b) return;
    const s = sim.current;
    let id: number | null = null;
    const coord = (e: PointerEvent) => (geoRef.current?.horizontal ? e.clientX : e.clientY);
    const down = (e: PointerEvent) => {
      if (e.button > 0) return;
      id = e.pointerId;
      b.setPointerCapture(e.pointerId);
      s.mode = "drag";
      s.drag = { start: coord(e), x0: s.x, last: s.x, lastT: performance.now() };
      b.dataset.dragging = "";
      wake.current();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const g = geoRef.current;
      if (!g) return;
      const d = coord(e) - s.drag.start;
      // Pulling the tape down (or right) brings lower values to the window.
      const nx = Math.max(s.target - DRAG_RANGE, Math.min(STOP - 0.1, s.drag.x0 - d / g.U));
      const now = performance.now();
      const dt = Math.max(1, now - s.drag.lastT) / 1000;
      s.v = s.v * 0.4 + ((nx - s.drag.last) / dt) * 0.6;
      s.drag.last = nx;
      s.drag.lastT = now;
      s.x = nx;
      wake.current();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      delete b.dataset.dragging;
      s.mode = "spring";
      wake.current();
    };
    const key = (e: KeyboardEvent) => {
      const dir = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      s.x = Math.max(s.target - DRAG_RANGE, Math.min(STOP - 0.1, s.x + dir * 1.5));
      s.v = 0;
      s.mode = "spring";
      wake.current();
    };
    b.addEventListener("pointerdown", down);
    b.addEventListener("pointermove", move);
    b.addEventListener("pointerup", up);
    b.addEventListener("pointercancel", up);
    b.addEventListener("keydown", key);
    return () => {
      b.removeEventListener("pointerdown", down);
      b.removeEventListener("pointermove", move);
      b.removeEventListener("pointerup", up);
      b.removeEventListener("pointercancel", up);
      b.removeEventListener("keydown", key);
    };
  }, [geo]);

  const label = fill(ui.tapeLabel, {
    figure: FIGURE,
    exam: edu.gradeX.exam,
    floor: FLOOR_TEXT,
    floorLabel: floorStat.label,
    from: BADGE_YEARS[0],
    to: BADGE_YEARS[BADGE_YEARS.length - 1],
  });

  return (
    <div
      ref={stage}
      className="tape__stage"
      data-pinned={still ? undefined : ""}
      data-orient={geo ? (geo.horizontal ? "h" : "v") : undefined}
    >
      <div className="tape__sky" ref={sky} aria-hidden="true">
        <Footage video={video} poster={poster} />
      </div>

      <header className="tape__head">
        <h2 id="tape-title" className="heading">
          {ui.tapeHeading}
        </h2>
        <p className="tape__hint">{ui.tapeHint}</p>
      </header>

      <div className="tape__figure-block">
        <p className="display-xl tape__figure">
          <span className="tape__figure-inner">{FIGURE}</span>
        </p>
        <p className="tape__exam">{edu.gradeX.exam}</p>
        <ul className="tape__extras">
          {edu.gradeX.extras.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <p className="sr-only">{label}</p>

      {/* The instrument. */}
      <div
        ref={band}
        className="tape__band"
        tabIndex={0}
        role="group"
        aria-label={label}
        aria-describedby="tape-keys"
      >
        <span id="tape-keys" className="sr-only">
          {ui.tapeKeys}
        </span>
        <div className="tape__track" aria-hidden="true">
          <div className="tape__strip" ref={strip}>
            {geo ? <Scale geo={geo} /> : null}
          </div>
        </div>
        <div className="tape__index" aria-hidden="true" />
        <div className="tape__trend" ref={trend} aria-hidden="true" />
        <div className="tape__window" aria-hidden="true">
          <span className="tape__drum">
            <span className="tape__reel" ref={(el) => void (drums.current[0] = el)}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </span>
          </span>
          <span className="tape__drum">
            <span className="tape__reel" ref={(el) => void (drums.current[1] = el)}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </span>
          </span>
          <span className="tape__point">.</span>
        </div>
        <div className="tape__fine" aria-hidden="true">
          <span className="tape__reel tape__reel--fine" ref={(el) => void (drums.current[2] = el)}>
            {[9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1].map((n, i) => (
              <span key={i}>{n}</span>
            ))}
          </span>
        </div>
        <span className="tape__unit" aria-hidden="true">
          %
        </span>
      </div>

      <p className="tape__floor" aria-hidden="true">
        <span className="tape__floor-glyph" />
        <span className="tape__floor-figure">{FLOOR_TEXT}</span>
        <span>{floorStat.label}</span>
      </p>

      <div className="tape__badges" aria-hidden="true">
        <p className="tape__badges-title">{badge.title}</p>
        <p className="tape__badges-note">{badge.yearLabel}</p>
        <ol className="tape__marks">
          {[...BADGE_YEARS].reverse().map((y, i) => (
            <li key={y} className="tape__mark" style={{ ["--k" as string]: BADGE_YEARS.length - 1 - i }}>
              <span className="tape__mark-glyph" />
              <span className="tape__mark-year">{y}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** The landed flag lives on the DOM (not React state), so re-renders never reset it. */
function setLandedAttr(el: HTMLElement | null, on: boolean) {
  if (!el) return;
  if (on) el.dataset.landed = "";
  else delete el.dataset.landed;
}

/** Graduations every 0.1, half and whole units; numerals on whole units; the bug at the floor. */
function Scale({ geo }: { geo: Geo }) {
  const { horizontal: H, U } = geo;
  const svg = useMemo(() => {
    const ticks: React.ReactNode[] = [];
    const nums: React.ReactNode[] = [];
    // Position along the tape for value v.
    const at = (v: number) => (H ? v * U : (VMAX - v) * U);
    for (let k = 0; k <= STOP * 10; k++) {
      const v = k / 10;
      const p = at(v);
      const major = k % 10 === 0;
      const half = k % 5 === 0;
      const len = major ? 26 : half ? 15 : 7;
      ticks.push(
        H ? (
          <line key={k} x1={p} x2={p} y1={0} y2={len} className={major ? "t-major" : half ? "t-half" : "t-fine"} />
        ) : (
          <line key={k} x1={0} x2={len} y1={p} y2={p} className={major ? "t-major" : half ? "t-half" : "t-fine"} />
        ),
      );
      if (major)
        nums.push(
          H ? (
            <text key={k} x={p} y={50} textAnchor="middle" className="t-num">
              {v}
            </text>
          ) : (
            <text key={k} x={36} y={p} dominantBaseline="central" className="t-num">
              {v}
            </text>
          ),
        );
    }
    const len = VMAX * U;
    const across = H ? 76 : 132;
    const stopA = Math.min(at(STOP), at(VMAX));
    const stopLen = (VMAX - STOP) * U;
    const f0 = at(FLOOR);
    const f1 = at(STOP);
    const bugAt = at(FLOOR);
    return (
      <svg
        className="tape__svg"
        width={H ? len : across + 280}
        height={H ? across + 120 : len}
        viewBox={H ? `0 0 ${len} ${across + 120}` : `0 0 ${across + 280} ${len}`}
      >
        <defs>
          <pattern id="tape-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" className="t-hatch" />
          </pattern>
        </defs>
        {/* The stop above 100: a hatched band. */}
        {H ? (
          <rect x={at(STOP)} y={0} width={stopLen} height={across} fill="url(#tape-hatch)" />
        ) : (
          <rect x={0} y={stopA} width={across} height={stopLen} fill="url(#tape-hatch)" />
        )}
        {ticks}
        {nums}
        {/* His range: 96 to 100, a band on the tape's inner edge. */}
        {H ? (
          <rect x={f0} y={across - 5} width={f1 - f0} height={5} className="t-range" />
        ) : (
          <rect x={across - 5} y={f1} width={5} height={f0 - f1} className="t-range" />
        )}
        {/* The bug: a notched marker at the floor, with its label beside it. */}
        {H ? (
          <g transform={`translate(${bugAt} ${across})`}>
            <path d="M -15 2 L 15 2 L 15 22 L -15 22 Z M -7 2 L 0 11 L 7 2" className="t-bug" />
          </g>
        ) : (
          <g transform={`translate(${across} ${bugAt})`}>
            <path d="M 2 -17 L 22 -17 L 22 17 L 2 17 Z M 2 -8 L 11 0 L 2 8" className="t-bug" />
            <text x={40} y={-4} className="t-bug-figure">
              {FLOOR_TEXT}
            </text>
            <text x={40} y={20} className="t-bug-label">
              {floorStat.label}
            </text>
          </g>
        )}
      </svg>
    );
  }, [H, U]);
  return svg;
}
