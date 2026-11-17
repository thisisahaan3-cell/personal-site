"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { fill } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/motion";
import type { ChamberScene, Projected } from "./chamberScene";
import { PlanView } from "./PlanView";
import { Readout } from "./Readout";
import { filterKey, HEADLINE, matches, PRESENT_LEVELS, SEATS, YEARS, type Filter } from "./seats";

const ui = site.ui.modelUn;

type Mode = "pending" | "3d" | "plan";

export function Chamber() {
  const [mode, setMode] = useState<Mode>("pending");
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  // 3D on desktop with motion and WebGL; the SVG plan on phones, under reduced motion and as fallback.
  useEffect(() => {
    const decide = () => {
      const plan = prefersReducedMotion() || window.innerWidth < 760 || !hasWebGL();
      setMode(plan ? "plan" : "3d");
    };
    decide();
    const mq = window.matchMedia("(max-width: 759px)");
    mq.addEventListener("change", decide);
    return () => mq.removeEventListener("change", decide);
  }, []);

  const fail = useCallback(() => setMode("plan"), []);
  const lit = SEATS.filter((s) => matches(s, filter)).length;
  const shown = active ?? pinned;

  const controls = (
    <Filters
      filter={filter}
      onFilter={(f) => setFilter(f)}
      status={fill(ui.shown, { n: lit, total: SEATS.length })}
    />
  );

  if (mode === "plan") {
    return (
      <section className="chamber chamber--plan" aria-labelledby="chamber-title">
        <Headline />
        <PlanView
          filter={filter}
          active={shown}
          onSelect={(id) => setPinned((p) => (p === id ? null : id))}
        />
        {controls}
      </section>
    );
  }

  return (
    <section className="chamber" aria-labelledby="chamber-title">
      <Stage
        ready={mode === "3d"}
        onFail={fail}
        filter={filter}
        active={shown}
        setActive={setActive}
        pinned={pinned}
        setPinned={setPinned}
        controls={controls}
      />
    </section>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Headline() {
  return (
    <header className="chamber__head">
      <h2 id="chamber-title" className="display-l chamber__title">
        {HEADLINE.split(/(?<=,) /).map((part, i) => (
          <span key={i} className="chamber__title-line">
            {part}
          </span>
        ))}
      </h2>
    </header>
  );
}

function Filters({ filter, onFilter, status }: { filter: Filter; onFilter: (f: Filter) => void; status: string }) {
  const key = filterKey(filter);
  const btn = (f: Filter, label: string | number) => (
    <button
      key={filterKey(f)}
      type="button"
      className="chamber__filter"
      data-filter={filterKey(f)}
      aria-pressed={key === filterKey(f)}
      onClick={() => onFilter(key === filterKey(f) ? { kind: "all" } : f)}
    >
      {label}
    </button>
  );
  return (
    <div className="chamber__controls">
      <div className="chamber__filters" role="group" aria-label={ui.filtersLabel}>
        {btn({ kind: "all" }, ui.all)}
        <span className="chamber__group" role="group" aria-label={ui.byYear}>
          {YEARS.map((y) => btn({ kind: "year", year: y }, y))}
        </span>
        <span className="chamber__group" role="group" aria-label={ui.byAward}>
          {PRESENT_LEVELS.map((l) => btn({ kind: "level", level: l }, l))}
        </span>
      </div>
      <p className="chamber__status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

function Stage({
  ready,
  onFail,
  filter,
  active,
  setActive,
  pinned,
  setPinned,
  controls,
}: {
  ready: boolean;
  onFail: () => void;
  filter: Filter;
  active: string | null;
  setActive: (id: string | null) => void;
  pinned: string | null;
  setPinned: (f: (p: string | null) => string | null) => void;
  controls: React.ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const readout = useRef<HTMLDivElement>(null);
  const scene = useRef<ChamberScene | null>(null);
  const activeIndex = useRef(-1);
  const dragged = useRef(false);
  const [loaded, setLoaded] = useState(false);

  const place = useCallback((p: Projected[]) => {
    const fly = scene.current?.flyProgress ?? 0;
    const st = stage.current;
    if (st) {
      if (fly > 0.75) st.dataset.settled = "";
      else delete st.dataset.settled;
    }
    p.forEach((q, i) => {
      const b = buttons.current[i];
      if (!b) return;
      b.style.transform = `translate3d(${q.x - q.w / 2}px, ${q.y - q.h / 2}px, 0)`;
      b.style.width = `${q.w}px`;
      b.style.height = `${q.h}px`;
    });
    const r = readout.current;
    const a = activeIndex.current;
    if (r && a >= 0 && p[a]) {
      const W = st?.clientWidth ?? 0;
      const x = Math.max(150, Math.min(W - 150, p[a].x));
      r.style.transform = `translate3d(${x}px, ${p[a].top - 16}px, 0) translate(-50%, -100%)`;
    }
  }, []);

  // Build the scene once WebGL is chosen. Three.js is fetched here, so only this route loads it.
  useEffect(() => {
    if (!ready) return;
    const cv = canvas.current;
    const st = stage.current;
    if (!cv || !st) return;
    let cancelled = false;
    let s: ChamberScene | null = null;
    let ro: ResizeObserver | null = null;
    document.fonts.ready
      .then(() => import("./chamberScene"))
      .then(({ ChamberScene }) => {
        if (cancelled) return;
        s = new ChamberScene(cv, SEATS);
        s.onFrame = place;
        scene.current = s;
        const size = () => s?.resize(st.clientWidth, st.clientHeight);
        size();
        ro = new ResizeObserver(size);
        ro.observe(st);
        s.start();
        setLoaded(true);
        window.dispatchEvent(new Event("scroll"));
      })
      .catch(() => {
        if (!cancelled) onFail();
      });
    return () => {
      cancelled = true;
      ro?.disconnect();
      s?.destroy();
      scene.current = null;
    };
  }, [ready, onFail, place]);

  // Scroll scrubs the fly-in: overhead plan at the pin, eye level by halfway.
  useEffect(() => {
    const st = stage.current;
    const section = st?.parentElement;
    if (!section) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? -r.top / span : 1;
      scene.current?.setFly(p / 0.5);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, [loaded]);

  // Hover state and filters into the scene.
  useEffect(() => {
    activeIndex.current = active ? SEATS.findIndex((s) => s.id === active) : -1;
    scene.current?.setHover(active);
  }, [active, loaded]);
  useEffect(() => {
    scene.current?.setLit((s) => matches(s, filter));
  }, [filter, loaded]);

  // Drag orbits (mouse, pen, or a horizontal touch drag).
  useEffect(() => {
    const st = stage.current;
    if (!st) return;
    let down: { x: number; y: number; id: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(".chamber__controls")) return;
      down = { x: e.clientX, y: e.clientY, id: e.pointerId };
      dragged.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      if (!dragged.current && Math.abs(dx) > 6) {
        dragged.current = true;
        st.dataset.dragging = "";
      }
      if (dragged.current) {
        scene.current?.orbitBy(e.movementX || dx * 0.1);
      }
    };
    const onUp = () => {
      down = null;
      delete st.dataset.dragging;
      setTimeout(() => (dragged.current = false), 0);
    };
    st.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      st.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const activeSeat = active ? SEATS.find((s) => s.id === active) : null;

  return (
    <div
      ref={stage}
      className="chamber__stage"
      data-loaded={loaded ? "" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setPinned(() => null);
          setActive(null);
        }
      }}
    >
      <canvas ref={canvas} className="chamber__canvas" aria-hidden="true" />
      <Headline />
      <p className="chamber__hint">{ui.hint}</p>
      <div className="chamber__seats" role="group" aria-label={ui.chamberLabel}>
        {SEATS.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            className="chamber__seat"
            aria-label={s.label}
            aria-pressed={pinned === s.id}
            data-dim={matches(s, filter) ? undefined : ""}
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(s.id)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(pinned)}
            onFocus={() => setActive(s.id)}
            onBlur={() => setActive(pinned)}
            onClick={(e) => {
              if (dragged.current) {
                e.preventDefault();
                return;
              }
              setPinned((p) => (p === s.id ? null : s.id));
              setActive(s.id);
            }}
          />
        ))}
      </div>
      <div className="chamber__readout" ref={readout} data-on={activeSeat ? "" : undefined} aria-hidden="true">
        {activeSeat ? <Readout seat={activeSeat} /> : null}
      </div>
      {controls}
    </div>
  );
}
