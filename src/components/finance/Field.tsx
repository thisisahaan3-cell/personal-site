"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { fill } from "@/lib/content";
import { useReducedMotion } from "@/lib/motion";
import { scrollToY } from "@/components/SmoothScroll";
import { useStage } from "@/components/three/Stage3D";
import {
  CanvasRenderer,
  columnPoint,
  columnRankAt,
  FieldSim,
  geometry,
  ordinalKey,
  rulePoint,
  STATES,
  type FieldRenderer,
  type Geo,
} from "./field";

const ui = site.ui.finance;
const suffixes = site.ui.competitions.financeFigure.ordinalSuffixes;
const fmt = (n: number) => n.toLocaleString("en-IN");
const ordinal = (n: number) => fill(ui.readoutPlace, { n: fmt(n), suffix: suffixes[ordinalKey(n)] });

function byName(prefix: string) {
  const c = site.competitions.find((x) => x.name.startsWith(prefix));
  if (!c) throw new Error(`Missing competition ${prefix}`);
  return c;
}

type Step = {
  key: "nfo" | "fellowship" | "srcc" | "shisfest";
  figure: string;
  name: string;
  short: string;
  year?: string;
  lines: string[];
  note?: string;
  scale: string;
  scalePhone: string;
};

/** The four results, all words from site.ts. */
function buildSteps(): Step[] {
  const nfo = byName("National Finance Olympiad");
  const srcc = byName("SRCC Finance Olympiad");
  const shis = byName("SHISFEST");
  const fellow = site.experience.find((e) => e.org === "srcc");
  if (!fellow) throw new Error("Missing SRCC fellowship");
  const s = ui.steps;
  return [
    {
      key: "nfo",
      figure: s.nfo.figure,
      name: nfo.name,
      short: nfo.name,
      year: nfo.year,
      lines: [nfo.results[1]],
      note: nfo.results[0],
      scale: s.nfo.scale,
      scalePhone: s.nfo.scalePhone,
    },
    {
      key: "fellowship",
      figure: s.fellowship.figure,
      name: fellow.title,
      short: fellow.title,
      lines: [fellow.points[0]],
      note: fellow.organisation,
      scale: s.fellowship.scale,
      scalePhone: s.fellowship.scalePhone,
    },
    {
      key: "srcc",
      figure: s.srcc.figure,
      name: srcc.name,
      short: srcc.name,
      year: srcc.year,
      lines: srcc.results,
      scale: s.srcc.scale,
      scalePhone: s.srcc.scale,
    },
    {
      key: "shisfest",
      figure: s.shisfest.figure,
      name: shis.name,
      short: shis.name,
      year: shis.year,
      lines: shis.results,
      scale: s.shisfest.scale,
      scalePhone: s.shisfest.scale,
    },
  ];
}
const STEPS = buildSteps();
const N_STATES = STATES.length;

export function Field() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <section className="field field--static" aria-labelledby="field-title">
        <FieldTitle />
        {STEPS.map((_, i) => (
          <Stage key={i} fixed={i + 1} />
        ))}
      </section>
    );
  }
  return <PinnedField />;
}

function FieldTitle() {
  return (
    <header className="field__title">
      <h2 id="field-title" className="heading">
        {ui.fieldHeading}
      </h2>
      <p className="field__intro">{ui.fieldIntro}</p>
    </header>
  );
}

function PinnedField() {
  const section = useRef<HTMLElement>(null);
  const [state, setState] = useState(0);

  // Scroll position → state, while pinned.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? -r.top / span : 0;
      setState(Math.max(0, Math.min(N_STATES - 1, Math.floor(p * N_STATES))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /** Buttons and swipes move the scroll position, so scroll stays the one source of truth. */
  const go = useCallback((s: number) => {
    const el = section.current;
    if (!el) return;
    const target = Math.max(0, Math.min(N_STATES - 1, s));
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const span = r.height - window.innerHeight;
    scrollToY(top + ((target + 0.5) / N_STATES) * span);
  }, []);

  return (
    <section ref={section} className="field" aria-labelledby="field-title">
      <Stage state={state} go={go} pinned />
    </section>
  );
}

type Labels = {
  geo: Geo;
};

function Stage({ state: liveState, fixed, go, pinned }: { state?: number; fixed?: number; go?: (s: number) => void; pinned?: boolean }) {
  const state = fixed ?? liveState ?? 0;
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const crossH = useRef<HTMLDivElement>(null);
  const crossV = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  const sim = useRef<FieldSim | null>(null);
  const renderer = useRef<FieldRenderer | null>(null);
  const [labels, setLabels] = useState<Labels | null>(null);
  const [started, setStarted] = useState(Boolean(fixed));
  const stateRef = useRef(state);
  const startedRef = useRef(started);
  const wake = useRef<() => void>(() => {});
  const stageApi = useStage();

  // Build the simulation and renderer; rebuild when the phone/desktop scale changes.
  useEffect(() => {
    const st = stage.current;
    const cv = canvas.current;
    if (!st || !cv) return;
    let raf = 0;
    let running = false;
    let visible = false;
    let last = performance.now();
    let quiet = 0;
    let phone: boolean | null = null;

    const build = () => {
      const w = st.clientWidth;
      const h = st.clientHeight;
      const g = geometry(w, h);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (phone !== g.phone || !sim.current || !renderer.current) {
        renderer.current?.destroy();
        phone = g.phone;
        sim.current = new FieldSim(g);
        let r: FieldRenderer;
        if (g.phone || fixed) r = new CanvasRenderer(cv);
        else {
          // Desktop: drawn as THREE.Points in the page's one shared renderer (one WebGL context).
          const deferred = new DeferredRenderer();
          r = deferred;
          const n = g.n;
          stageApi
            .engine()
            .then((e) => import("./fieldView").then((m) => deferred.attach(new m.ThreeFieldRenderer(e, st, n))))
            .catch(() => deferred.attach(new CanvasRenderer(cv)));
        }
        renderer.current = r;
        if (startedRef.current) sim.current.setState(stateRef.current, Boolean(fixed));
      } else sim.current.resize(g);
      renderer.current.resize(w, h, dpr);
      setLabels({ geo: g });
      renderer.current.draw(sim.current);
      wakeUp();
    };

    const frame = (now: number) => {
      raf = 0;
      const s = sim.current;
      const r = renderer.current;
      if (!s || !r || !running) return;
      const dt = (now - last) / 1000;
      last = now;
      s.step(dt);
      r.draw(s);
      quiet = s.settled() ? quiet + 1 : 0;
      // Sleep once everything is still; pointer movement or a new state wakes it.
      if (quiet < 30) raf = requestAnimationFrame(frame);
    };
    const wakeUp = () => {
      quiet = 0;
      if (running && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    wake.current = wakeUp;
    const update = () => {
      const should = visible && !document.hidden && !fixed;
      if (should && !running) {
        running = true;
        wakeUp();
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    build();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !startedRef.current) {
        startedRef.current = true;
        setStarted(true);
        sim.current?.setState(stateRef.current);
      }
      update();
    });
    io.observe(st);
    const ro = new ResizeObserver(() => build());
    ro.observe(st);
    document.addEventListener("visibilitychange", update);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", update);
      renderer.current?.destroy();
      renderer.current = null;
      sim.current = null;
    };
  }, [fixed, stageApi]);

  // State changes drive the simulation.
  useEffect(() => {
    stateRef.current = state;
    if (!startedRef.current) return;
    sim.current?.setState(state, Boolean(fixed));
    if (fixed) {
      if (sim.current && renderer.current) renderer.current.draw(sim.current);
    } else wake.current();
  }, [state, fixed]);

  // Pointer: points part, crosshair reads the rank under it. Touch: horizontal swipe changes state.
  useEffect(() => {
    const st = stage.current;
    if (!st || fixed) return;
    let swipe: { x: number; y: number; id: number } | null = null;

    const read = (x: number, y: number) => {
      const s = sim.current;
      const ro = readout.current;
      if (!s || !ro) return;
      const g = s.g;
      const st0 = STATES[stateRef.current];
      let text = "";
      if (st0 === "nfo") {
        const k = columnRankAt(g, x, y);
        if (k >= 0) {
          if (g.scale === 1) text = fill(ui.readoutRank, { n: fmt(k + 1), suffix: suffixes[ordinalKey(k + 1)], total: fmt(g.n) });
          else text = fill(ui.readoutBin, { from: fmt(k * g.scale + 1), to: fmt((k + 1) * g.scale), total: fmt(g.n * g.scale) });
        }
      } else if (st0 === "srcc" || st0 === "shisfest") {
        const k = Math.round((x - g.rule.x0) / g.rule.step);
        const max = st0 === "srcc" ? g.rule.count - 1 : 0;
        if (k >= 0 && k <= max && Math.abs(y - g.rule.y) < 36) text = ordinal(k + 1);
      }
      ro.textContent = text;
      ro.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0)`;
      if (text) ro.dataset.on = "";
      else delete ro.dataset.on;
    };

    const move = (e: PointerEvent) => {
      const r = st.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const s = sim.current;
      if (s) {
        s.pointer.x = x;
        s.pointer.y = y;
        s.pointer.on = true;
      }
      if (crossH.current) crossH.current.style.transform = `translate3d(0, ${y}px, 0)`;
      if (crossV.current) crossV.current.style.transform = `translate3d(${x}px, 0, 0)`;
      st.dataset.pointer = "";
      read(x, y);
      wake.current();
    };
    const leave = () => {
      if (sim.current) sim.current.pointer.on = false;
      delete st.dataset.pointer;
      if (readout.current) delete readout.current.dataset.on;
      wake.current();
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") swipe = { x: e.clientX, y: e.clientY, id: e.pointerId };
      move(e);
    };
    const up = (e: PointerEvent) => {
      if (swipe && e.pointerId === swipe.id) {
        const dx = e.clientX - swipe.x;
        const dy = e.clientY - swipe.y;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go?.(stateRef.current + (dx < 0 ? 1 : -1));
        swipe = null;
      }
      if (e.pointerType !== "mouse") leave();
    };
    st.addEventListener("pointermove", move);
    st.addEventListener("pointerdown", down);
    st.addEventListener("pointerup", up);
    st.addEventListener("pointercancel", leave);
    st.addEventListener("pointerleave", leave);
    return () => {
      st.removeEventListener("pointermove", move);
      st.removeEventListener("pointerdown", down);
      st.removeEventListener("pointerup", up);
      st.removeEventListener("pointercancel", leave);
      st.removeEventListener("pointerleave", leave);
    };
  }, [fixed, go]);

  const id = STATES[state];
  const step = state > 0 ? STEPS[state - 1] : null;
  const g = labels?.geo;

  return (
    <div
      ref={stage}
      className="field__stage"
      data-state={id}
      data-pinned={pinned ? "" : undefined}
      data-static={fixed ? "" : undefined}
    >
      <canvas ref={canvas} className="field__canvas" aria-hidden="true" />
      {!fixed ? (
        <>
          <div className="field__cross field__cross--h" ref={crossH} aria-hidden="true" />
          <div className="field__cross field__cross--v" ref={crossV} aria-hidden="true" />
          <div className="field__readout" ref={readout} aria-hidden="true" />
        </>
      ) : null}

      {g ? <ChartLabels geo={g} id={id} /> : null}

      {pinned ? <FieldTitle /> : null}

      <div className="field__panel" aria-live={pinned ? "polite" : undefined}>
        {step ? (
          <div className="field__step" key={step.key}>
            <p className="field__figure" data-long={step.figure.length > 7 ? "" : undefined}>
              {step.figure}
            </p>
            <h3 className="field__name">{step.name}</h3>
            {step.year ? <p className="field__year">{step.year}</p> : null}
            {step.lines.map((l) => (
              <p key={l} className="field__line">
                {l}
              </p>
            ))}
            {step.note ? <p className="field__note">{step.note}</p> : null}
            <p className="field__scale">{g?.phone ? step.scalePhone : step.scale}</p>
          </div>
        ) : (
          <div className="field__step" key="field">
            <p className="field__figure field__figure--pool">{ui.steps.nfo.pool}</p>
            <p className="field__scale">{g?.phone ? ui.steps.nfo.scalePhone : ui.steps.nfo.scale}</p>
          </div>
        )}
      </div>

      {pinned ? (
        <nav className="field__steps" aria-label={ui.stepsLabel}>
          <ul>
            {STEPS.map((s, i) => (
              <li key={s.key}>
                <button
                  type="button"
                  className="field__btn"
                  aria-current={state === i + 1 ? "step" : undefined}
                  onClick={() => go?.(i + 1)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") go?.(i + 2);
                    if (e.key === "ArrowLeft") go?.(i);
                  }}
                >
                  <span className="field__btn-rule" aria-hidden="true" />
                  <span className="field__btn-figure">{s.figure}</span>
                  <span className="field__btn-name">{s.short}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

/** Scale marks drawn in DOM over the canvas: real text, positioned from the same geometry. */
function ChartLabels({ geo: g, id }: { geo: Geo; id: (typeof STATES)[number] }) {
  if (id === "nfo") {
    const c = g.column;
    const a = columnPoint(g, c.amber);
    const right = c.x + c.cols * c.step;
    return (
      <div className="field__labels" aria-hidden="true">
        <span className="field__tick" style={{ transform: `translate3d(${c.x - 10}px, ${c.y}px, 0)` }} data-align="end">
          {ui.rankTop}
        </span>
        <span
          className="field__tick"
          style={{ transform: `translate3d(${c.x - 10}px, ${c.y + c.rows * c.step}px, 0)` }}
          data-align="end"
          data-bottom=""
        >
          {fmt(g.n * g.scale)}
        </span>
        <span
          className="field__leader"
          style={{ transform: `translate3d(${a.x + 8}px, ${a.y}px, 0) scaleX(${right - a.x + 16})` }}
        />
        <span className="field__mark" style={{ transform: `translate3d(${right + 30}px, ${a.y}px, 0)` }}>
          {ui.steps.nfo.figure}
        </span>
      </div>
    );
  }
  if (id === "srcc" || id === "shisfest") {
    const last = id === "srcc" ? g.rule.count - 1 : 0;
    const end = rulePoint(g, last);
    const start = g.rule.x0 - 18;
    const solid = end.x + g.rule.step + 10 - start;
    return (
      <div className="field__labels" aria-hidden="true">
        <span className="field__rule" style={{ transform: `translate3d(${start}px, ${g.rule.y}px, 0) scaleX(${solid})` }} />
        <span
          className="field__rule field__rule--open"
          style={{ left: start + solid, top: g.rule.y, width: Math.max(0, g.W - (start + solid)) }}
        />
        <span className="field__tick" style={{ transform: `translate3d(${g.rule.x0}px, ${g.rule.y + 18}px, 0)` }} data-align="mid">
          {ui.rankTop}
        </span>
        {id === "srcc" ? (
          <span className="field__mark" data-align="mid" style={{ transform: `translate3d(${end.x}px, ${g.rule.y + 30}px, 0)` }}>
            {last + 1}
          </span>
        ) : null}
      </div>
    );
  }
  return null;
}

/** Stands in until the shared renderer is ready, then hands over the last size and frame. */
class DeferredRenderer implements FieldRenderer {
  private inner: FieldRenderer | null = null;
  private size: [number, number, number] | null = null;
  private sim: FieldSim | null = null;
  private dead = false;
  attach(r: FieldRenderer) {
    if (this.dead) {
      r.destroy();
      return;
    }
    this.inner = r;
    if (this.size) r.resize(...this.size);
    if (this.sim) r.draw(this.sim);
  }
  resize(w: number, h: number, dpr: number) {
    this.size = [w, h, dpr];
    this.inner?.resize(w, h, dpr);
  }
  draw(sim: FieldSim) {
    this.sim = sim;
    this.inner?.draw(sim);
  }
  destroy() {
    this.dead = true;
    this.inner?.destroy();
  }
}
