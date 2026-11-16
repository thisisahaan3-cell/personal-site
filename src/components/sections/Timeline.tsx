"use client";

import { AnimatePresence, motion as m } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { site, type TimelineCategory, type TimelineEvent } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { tileFor } from "@/lib/content";
import { useMotion } from "../motion/MotionProvider";
import { Chapter, ChapterHead, ChapterNote, ChapterTitle, LogoTile, Run } from "../primitives";

const ui = site.ui.timeline;
const events = site.timeline;
const ongoing = site.competitions.filter((c) => c.ongoing);
const FILTERS = ui.filters;

function filterOf(cat: TimelineCategory) {
  return FILTERS.find((f) => f.categories?.includes(cat));
}
function matches(ev: TimelineEvent, filterId: string) {
  const f = FILTERS.find((x) => x.id === filterId);
  return !f?.categories || f.categories.includes(ev.category);
}

/* ── Geometry for the horizontal version (§4.1), computed from the data ── */

const FILLET = 24;
const LEAD = 160;
const TAIL = 160;
const MARK = 224;

type Placed = { ev: TimelineEvent; index: number; x: number; up: boolean };

function layout() {
  const years = events.map((e) => e.year);
  const first = Math.min(...years);
  const last = Math.max(...years);
  const placed: Placed[] = [];
  const ticks: { year: number; x: number }[] = [];
  const breaks: { x: number; from: number; to: number }[] = [];
  // A year inside the Scholar Badge span with no events is a bay of its own: tick, label, ring.
  const rings = events.find((e) => e.span?.style === "rings")?.span;
  const inRings = (y: number) => !!rings && y >= rings.from && y <= rings.to;
  let x = FILLET + LEAD;
  let n = 0;
  for (let y = first; y <= last; ) {
    const evs = events.filter((e) => e.year === y);
    if (!evs.length && inRings(y)) {
      ticks.push({ year: y, x });
      x += 64;
      y++;
    } else if (evs.length) {
      ticks.push({ year: y, x });
      evs.forEach((ev, i) => {
        placed.push({ ev, index: events.indexOf(ev), x: x + 64 + 88 * i, up: n % 2 === 0 });
        n++;
      });
      x += 64 + 88 * evs.length;
      y++;
    } else {
      const from = y;
      while (y <= last && !events.some((e) => e.year === y) && !inRings(y)) y++;
      breaks.push({ x: x + 24, from, to: y - 1 });
      x += 48;
    }
  }
  x += TAIL;
  const L = x + FILLET;
  const yearX = (yr: number) =>
    ticks.find((t) => t.year === yr)?.x ?? breaks.find((b) => yr >= b.from && yr <= b.to)?.x ?? null;
  placed.sort((a, b) => a.x - b.x);
  return { placed, ticks, breaks, L, yearX };
}

const GEO = layout();

/** Track position of the last entry the filter shows. */
function lastMatchX(filterId: string) {
  for (let k = GEO.placed.length - 1; k >= 0; k--) if (matches(GEO.placed[k].ev, filterId)) return GEO.placed[k].x;
  return GEO.placed[GEO.placed.length - 1]?.x ?? 0;
}

/** Index of the matching entry nearest the reading mark at progress p. */
function nearest(p: number, filterId: string) {
  const markX = MARK + p * GEO.L;
  let best = -1;
  let bestD = Infinity;
  GEO.placed.forEach((pl, k) => {
    if (!matches(pl.ev, filterId)) return;
    const d = Math.abs(pl.x - markX);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  });
  return best;
}

function Filters({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="tl-filters" role="group" aria-label={ui.filtersLabel}>
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          className="tbtn"
          aria-pressed={value === f.id}
          onClick={() => onChange(f.id)}
        >
          <span className="u">{f.label}</span>
        </button>
      ))}
    </div>
  );
}

function BadgeRings({ gap }: { gap: number }) {
  return (
    <span className="tl-badge-rings" aria-hidden="true" style={{ gap: gap - 9 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="tl-ring-inline" />
      ))}
    </span>
  );
}

function InProgress({ className = "", ref }: { className?: string; ref?: Ref<HTMLDivElement> }) {
  return (
    <div className={className} ref={ref}>
      <h3 className="t-title2">{ui.inProgressHeading}</h3>
      <ul className="tl-ongoing">
        {ongoing.map((c) => (
          <li key={c.name}>
            <span className="t-body">{c.name}</span> <span className="t-data fg2">{ui.ongoing}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Timeline() {
  const { horizontal } = useMotion();
  const [filter, setFilter] = useState("all");
  return horizontal ? (
    <HorizontalTimeline filter={filter} setFilter={setFilter} />
  ) : (
    <VerticalTimeline filter={filter} setFilter={setFilter} />
  );
}

/* ── Vertical version (§4.2): phones, tablets, touch, short viewports, reduced motion ── */

function VerticalTimeline({ filter, setFilter }: { filter: string; setFilter: (f: string) => void }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const years = Array.from(new Set(events.map((e) => e.year)));
  return (
    <Chapter id="timeline" className="tl-v">
      <ChapterHead id="timeline" />
      <Run className="pb-title">
        <Filters value={filter} onChange={setFilter} />
      </Run>
      {years.map((y) => {
        const evs = events.map((ev, i) => ({ ev, i })).filter((x) => x.ev.year === y);
        const any = evs.some((x) => matches(x.ev, filter));
        return (
          <Run key={y} className="tl-year" style={any ? undefined : { display: "none" }}>
            <span className="tl-ytick" aria-hidden="true" />
            <p className="t-data tl-ylabel">{y}</p>
            <ul className="tl-vlist">
              {evs.map(({ ev, i }) => (
                <li key={i} hidden={!matches(ev, filter)} className={open[i] ? "is-open" : ""}>
                  <span className="tl-vring" aria-hidden="true" />
                  <details onToggle={(e) => setOpen((o) => ({ ...o, [i]: (e.target as HTMLDetailsElement).open }))}>
                    <summary>
                      {ev.yearLabel && ev.yearLabel !== String(ev.year) && (
                        <span className="t-data fg2 tl-vyl">{ev.yearLabel}</span>
                      )}
                      <span className="t-label">{ev.title}</span>
                    </summary>
                    <div className="tl-vdetail">
                      <p className="t-small fg2 measure">{ev.detail}</p>
                      <LogoTile org={tileFor(ev.org, ev.title)} />
                    </div>
                  </details>
                  {ev.span?.style === "rings" && <BadgeRings gap={16} />}
                </li>
              ))}
            </ul>
          </Run>
        );
      })}
      <Run className="pb-block tl-v-progress">
        <InProgress />
      </Run>
    </Chapter>
  );
}

/* ── Horizontal pinned version (§4.1) ── */

function HorizontalTimeline({ filter, setFilter }: { filter: string; setFilter: (f: string) => void }) {
  const { scrollToY } = useMotion();
  const { placed, ticks, breaks, L, yearX } = GEO;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const filterRef = useRef(filter);
  const [sel, setSel] = useState(0);
  const selRef = useRef(0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const dragged = useRef(false);
  const mx = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelHidden = useRef(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Pin, track movement and the approach draw.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const update = (p: number) => {
      gsap.set(trackRef.current, { x: mx.current - p * L });
      // Hand-off at the end (§0.1 item 14), scroll-linked: once the last entry has reached the
      // reading mark, the panel fades out over the next 120px of travel, then "In progress" fades in
      // over the following 120px.
      const panel = panelRef.current;
      const progress = progressRef.current;
      if (panel && progress) {
        const lastX = lastMatchX(filterRef.current);
        const d = p * L + MARK - lastX;
        const panelO = Math.min(1, Math.max(0, 1 - d / 120));
        const progO = Math.min(1, Math.max(0, (d - 120) / 120));
        gsap.set(panel, { opacity: panelO });
        gsap.set(progress, { opacity: progO });
        const hide = panelO === 0;
        if (hide !== panelHidden.current) {
          panelHidden.current = hide;
          panel.toggleAttribute("inert", hide);
          if (hide) panel.setAttribute("aria-hidden", "true");
          else panel.removeAttribute("aria-hidden");
        }
      }
      const k = nearest(p, filterRef.current);
      if (k >= 0 && k !== selRef.current) {
        selRef.current = k;
        setSel(k);
      }
    };
    const measure = () => {
      // Resolve the meridian in px once per refresh (cqw cannot be read from JS directly).
      const probe = section.querySelector<HTMLElement>(".tl-probe");
      mx.current = probe?.offsetLeft ?? 0;
    };
    measure();
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${L / 1.5}`,
      pin: true,
      refreshPriority: 1,
      onRefreshInit: measure,
      onUpdate: (s) => update(s.progress),
      onRefresh: (s) => update(s.progress),
    });
    stRef.current = st;
    update(0);

    let drawMax = 0;
    const entries = Array.from(section.querySelectorAll<HTMLElement>(".tl-entry"));
    const draw = (d: number) => {
      if (d < drawMax) return;
      drawMax = d;
      const W = L + 24;
      const vis = d >= 1 ? W : Math.min(W, d * (window.innerWidth - mx.current) + 12);
      gsap.set(drawRef.current, { x: vis - W });
      gsap.set(drawRef.current?.firstElementChild ?? null, { x: W - vis });
      entries.forEach((el) => {
        const x = Number(el.dataset.x);
        if (d >= 1 || x < vis - 12) gsap.to(el, { opacity: 1, duration: 0.3, overwrite: "auto" });
      });
    };
    if (entries.length) gsap.set(entries, { opacity: 0 });
    const drawST = ScrollTrigger.create({
      trigger: section,
      start: "top 40%",
      end: "top top",
      onUpdate: (s) => draw(s.progress),
      onRefresh: (s) => draw(s.progress),
    });
    draw(0);

    return () => {
      st.kill();
      drawST.kill();
      if (entries.length) gsap.set(entries, { clearProps: "opacity" });
      stRef.current = null;
    };
  }, [L]);

  // Filter changes: reselect without moving anything.
  useEffect(() => {
    filterRef.current = filter;
    const st = stRef.current;
    const k = nearest(st ? st.progress : 0, filter);
    if (k >= 0) {
      selRef.current = k;
      setSel(k);
    }
  }, [filter]);

  const scrollToEntry = (k: number, duration?: number) => {
    const st = stRef.current;
    if (!st) return;
    const p = Math.min(1, Math.max(0, (placed[k].x - MARK) / L));
    scrollToY(st.start + p * (st.end - st.start), duration);
  };

  const step = (dir: number | "home" | "end") => {
    const idx = placed.map((pl, k) => (matches(pl.ev, filter) ? k : -1)).filter((k) => k >= 0);
    if (!idx.length) return;
    let pos = idx.indexOf(selRef.current);
    if (dir === "home") pos = 0;
    else if (dir === "end") pos = idx.length - 1;
    else pos = Math.min(idx.length - 1, Math.max(0, (pos < 0 ? 0 : pos) + dir));
    const k = idx[pos];
    selRef.current = k;
    setSel(k);
    scrollToEntry(k, 0.3);
    btns.current[k]?.focus({ preventScroll: true });
  };

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number | "home" | "end"> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      Home: "home",
      End: "end",
    };
    if (e.key in map) {
      e.preventDefault();
      step(map[e.key]);
    }
  };

  // Drag the track to scroll the page (fine pointers only).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const startX = e.clientX;
    const startY = window.scrollY;
    dragged.current = false;
    const el = trackRef.current;
    el?.classList.add("is-grabbing");
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) >= 4) dragged.current = true;
      if (dragged.current) scrollToY(startY - dx / 1.5, 0);
    };
    const up = () => {
      el?.classList.remove("is-grabbing");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const cur = placed[sel];
  const scholar = yearX(2021) !== null;

  return (
    <section
      id="timeline"
      ref={sectionRef}
      aria-labelledby="timeline-title"
      className="chapter tl-h"
      data-chapter="timeline"
    >
      <span className="tl-probe" aria-hidden="true" />
      <div className="tl-head">
        <ChapterNote id="timeline" />
        <ChapterTitle id="timeline" />
        <Filters value={filter} onChange={setFilter} />
      </div>

      <div
        className="tl-track"
        ref={trackRef}
        style={{ width: L }}
        onPointerDown={onPointerDown}
        onClickCapture={(e) => {
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
            dragged.current = false;
          }
        }}
      >
        <div className="tl-draw" ref={drawRef} aria-hidden="true" style={{ width: L + 24 }}>
          <div className="tl-draw-inner">
            <span className="tl-stub-in" />
            <svg className="tl-fillet tl-fillet-in" viewBox="0 0 24 24">
              <path className="ln" d="M 0 0 A 24 24 0 0 0 24 24" />
            </svg>
            <span className="tl-axis" style={{ width: L - 2 * FILLET }} />
            <svg className="tl-fillet tl-fillet-out" viewBox="0 0 24 24" style={{ left: L - FILLET }}>
              <path className="ln" d="M 0 0 A 24 24 0 0 1 24 24" />
            </svg>
            <span className="tl-stub-out" style={{ left: L }} />
            {ticks.map((t) => (
              <span key={t.year} className="tl-tick" style={{ left: t.x }} />
            ))}
            {scholar &&
              [2021, 2022, 2023, 2024, 2025, 2026].map((yr) => {
                const x = yearX(yr);
                return x === null ? null : <span key={yr} className="tl-span-ring" style={{ left: x }} />;
              })}
          </div>
        </div>

        {ticks.map((t) => (
          <span key={t.year} className="tl-year-label t-data" style={{ left: t.x }} aria-hidden="true">
            {t.year}
          </span>
        ))}
        {breaks.map((b) => (
          <span key={b.x} className="tl-break" style={{ left: b.x }} aria-hidden="true">
            <i />
            <i />
          </span>
        ))}
        {(() => {
          const sof = events.find((e) => e.span?.style === "rule");
          if (!sof?.span) return null;
          const a = yearX(sof.span.from);
          const b = yearX(sof.span.to);
          if (a === null || b === null) return null;
          return <span className="tl-span-rule" style={{ left: a, width: b - a }} aria-hidden="true" />;
        })()}

        <div className="tl-entries" onKeyDown={onKey}>
          {placed.map((pl, k) => {
            const on = matches(pl.ev, filter);
            return (
              <button
                key={pl.index}
                ref={(el) => {
                  btns.current[k] = el;
                }}
                type="button"
                className={`tl-entry ${pl.up ? "up" : "down"} ${k === sel ? "is-sel" : ""} ${on ? "" : "is-off"}`}
                style={{ left: pl.x }}
                data-x={pl.x}
                tabIndex={k === sel ? 0 : -1}
                aria-current={k === sel ? "true" : undefined}
                onClick={() => {
                  selRef.current = k;
                  setSel(k);
                  scrollToEntry(k);
                }}
                onFocus={(e) => {
                  // Keyboard focus before the pin: jump to the pin start plus this entry's offset
                  // so the focused entry is on screen (QA defect 11).
                  const st = stRef.current;
                  if (st && !st.isActive && e.currentTarget.matches(":focus-visible")) scrollToEntry(k, 0);
                }}
              >
                <span className="tl-ring" aria-hidden="true" />
                <span className="tl-stem" aria-hidden="true" />
                <span className="tl-label">
                  {pl.ev.yearLabel && <span className="t-data fg2 block">{pl.ev.yearLabel}</span>}
                  <span className="t-label block">{pl.ev.title}</span>
                </span>
              </button>
            );
          })}
        </div>

        <InProgress className="tl-h-progress" ref={progressRef} />
      </div>

      <div className="tl-panel" aria-live="polite" ref={panelRef}>
        <AnimatePresence mode="wait" initial={false}>
          {cur && (
            <m.div
              key={cur.index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <p className="t-data">{cur.ev.yearLabel ?? cur.ev.year}</p>
              <p className="t-title2 tl-panel-title">{cur.ev.title}</p>
              {cur.ev.span?.style === "rings" && <BadgeRings gap={24} />}
              <div className="tl-panel-row">
                <div>
                  <p className="t-body measure">{cur.ev.detail}</p>
                  <p className="t-data fg2" style={{ marginTop: 12 }}>
                    {filterOf(cur.ev.category)?.label}
                  </p>
                </div>
                <LogoTile org={tileFor(cur.ev.org, cur.ev.title)} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
