"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { fill } from "@/lib/content";
import { useSetPieceMode } from "@/lib/three/quality";
import { Hotspots, type HotspotItem } from "@/components/three/Hotspots";
import { Loading } from "@/components/three/Loading";
import { pointerNdcOf } from "@/components/three/pointer";
import { useScene } from "@/components/three/useScene";
import { PlanView } from "./PlanView";
import { Readout } from "./Readout";
import { filterKey, HEADLINE, matches, PRESENT_LEVELS, SEATS, YEARS, type Filter } from "./seats";
import type { LawApi, LawPhase } from "./lawScene";

const ui = site.ui.modelUn;
const lui = site.ui.lawDiplomacy;
const law = site.lawDiplomacy;
const course = law.course;

const FLOOR = SEATS.filter((s) => s.kind === "floor");
const BENCH = SEATS.filter((s) => s.kind === "bench");

/** Bench placards, then the law corner: real buttons anchored in the scene. */
const HOTSPOTS: HotspotItem[] = [
  ...BENCH.map((s, i) => {
    const p = law.parliamentary[i];
    return {
      id: s.id,
      figure: String(p.year),
      line: p.name,
      sub: p.result ?? ("body" in p ? p.body : undefined) ?? undefined,
      // Down onto the empty floor: the first to the left, the second to the right.
      side: (i === 0 ? "left" : "right") as "left" | "right",
      reach: 150,
      rise: -60,
    };
  }),
  {
    id: "course",
    figure: course.duration,
    line: `${course.title}, ${course.year}`,
    sub: course.provider,
    label: `${lui.openCourse}: ${course.title}, ${course.provider}, ${course.year}`,
    side: "right",
    reach: 90,
    rise: 34,
  },
];

/**
 * "The chamber" (addendum §4): Executive Board on the dais first and largest, then the delegate
 * awards on the floor (filters stay), the parliamentary programmes on the side bench and the
 * IIT Madras Introduction to Law course in the law corner. Phones, reduced motion, no WebGL or a
 * failed load: the SVG plan in the same order, with the same information.
 */
export function Hall() {
  const mode = useSetPieceMode();
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);


  const lit = SEATS.filter((s) => s.kind === "floor" && matches(s, filter)).length;
  const status = fill(ui.shown, { n: lit, total: FLOOR.length });
  const controls = <Filters filter={filter} onFilter={setFilter} status={status} />;
  const want3d = mode === "motion";

  if (mode === "pending") {
    return <section className="hall hall--pending" aria-label={lui.title} />;
  }
  if (!want3d) {
    return <Plan filter={filter} controls={controls} active={hover ?? pinned} setPinned={setPinned} />;
  }
  return (
    <Live
      filter={filter}
      controls={controls}
      hover={hover}
      setHover={setHover}
      pinned={pinned}
      setPinned={setPinned}
      fallback={<Plan filter={filter} controls={controls} active={pinned} setPinned={setPinned} />}
    />
  );
}

// ── The three roles, named first and largest ──

function Board({ className }: { className?: string }) {
  return (
    <div className={`board-roles ${className ?? ""}`}>
      <h2 id="board-title" className="board-roles__heading">
        {lui.executiveBoardHeading}
      </h2>
      <ol className="board-roles__list">
        {law.executiveBoard.map((e) => (
          <li key={e.conference} className="board-roles__item">
            <p className="board-roles__role">{e.role}</p>
            <p className="board-roles__where">
              <span>{e.conference}</span>
              <span className="board-roles__committee">{e.committee}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Parliament() {
  return (
    <ul className="hall-list">
      {law.parliamentary.map((p) => (
        <li key={p.name} className="hall-list__row">
          <span className="hall-list__year">{p.year}</span>
          <span className="hall-list__name">
            {p.name}
            {"body" in p && p.body ? <span className="hall-list__sub">{p.body}</span> : null}
            {p.result ? <span className="hall-list__sub">{p.result}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Course({ titleId }: { titleId?: string }) {
  return (
    <div className="course-card">
      <p className="course-card__meta">
        <span className="course-card__year">{course.year}</span>
        <span>{course.provider}</span>
      </p>
      <h3 id={titleId} className="course-card__title">
        {course.title}
      </h3>
      <p className="course-card__duration">{course.duration}</p>
      <ul className="course-card__awards">
        {course.awards.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </div>
  );
}

function Filters({ filter, onFilter, status }: { filter: Filter; onFilter: (f: Filter) => void; status: string }) {
  const key = filterKey(filter);
  const btn = (f: Filter, label: string | number) => (
    <button
      key={filterKey(f)}
      type="button"
      className="chamber__filter"
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

// ── Phone, reduced motion, no WebGL: the plan, in the page's order ──

function Plan({
  filter,
  controls,
  active,
  setPinned,
}: {
  filter: Filter;
  controls: React.ReactNode;
  active: string | null;
  setPinned: (f: (p: string | null) => string | null) => void;
}) {
  return (
    <section className="hall hall--plan" aria-labelledby="board-title">
      <Board className="board-roles--plan" />
      <div className="hall-plan__floor">
        <h2 className="display-l hall-plan__headline">{HEADLINE}</h2>
        <PlanView filter={filter} active={active} onSelect={(id) => setPinned((p) => (p === id ? null : id))} />
        {controls}
      </div>
      <div className="hall-plan__pair">
        <div>
          <h2 className="heading hall-plan__sub">{lui.parliamentaryHeading}</h2>
          <Parliament />
        </div>
        <div>
          <h2 className="heading hall-plan__sub">{lui.courseHeading}</h2>
          <Course />
        </div>
      </div>
    </section>
  );
}

// ── The live chamber ──

function Live({
  filter,
  controls,
  hover,
  setHover,
  pinned,
  setPinned,
  fallback,
}: {
  filter: Filter;
  controls: React.ReactNode;
  hover: string | null;
  setHover: (id: string | null) => void;
  pinned: string | null;
  setPinned: (f: (p: string | null) => string | null) => void;
  fallback: React.ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const seatRefs = useRef<(HTMLElement | null)[]>([]);
  const hotRefs = useRef<(HTMLElement | null)[]>([]);
  const readout = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [phase, setPhase] = useState<LawPhase>("open");
  const [focus, setFocus] = useState<string | null>(null);

  const { engine, api, failed } = useScene<LawApi>(true, async (e) => {
    const { buildLaw } = await import("./lawScene");
    return buildLaw(e, {
      element: stage.current!,
      section: section.current!,
      seats: SEATS,
      seatButtons: () => seatRefs.current,
      hotspots: () => hotRefs.current,
      onPhase: setPhase,
      onRaised: (pt) => {
        const r = readout.current;
        const st = stage.current;
        if (!r || !st || !pt) return;
        const box = r.getBoundingClientRect();
        const sb = st.getBoundingClientRect();
        const dx = pt.x - (box.left - sb.left);
        const dy = pt.y - (box.bottom - sb.top);
        r.style.setProperty("--lead-len", `${Math.max(0, Math.hypot(dx, dy))}px`);
        r.style.setProperty("--lead-angle", `${Math.atan2(dy, dx)}rad`);
      },
    });
  });

  const raised = hover ?? pinned;
  useEffect(() => api?.raise(raised), [api, raised]);
  useEffect(() => api?.lit((s) => matches(s, filter)), [api, filter]);
  useEffect(() => api?.focus(focus), [api, focus]);

  // Pointer parallax and drag-to-look (mouse, pen or a horizontal touch drag).
  useEffect(() => {
    const st = stage.current;
    if (!st || !api) return;
    let down: { x: number; id: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(".chamber__controls, .hotspot__label")) return;
      down = { x: e.clientX, id: e.pointerId };
      dragged.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") api.pointer(pointerNdcOf(e, st));
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      if (!dragged.current && Math.abs(dx) > 6) {
        dragged.current = true;
        st.dataset.dragging = "";
      }
      if (dragged.current) {
        api.drag(dx);
        down.x = e.clientX;
      }
    };
    const onUp = () => {
      down = null;
      delete st.dataset.dragging;
      setTimeout(() => (dragged.current = false), 0);
    };
    const onLeave = () => api.pointer(null);
    st.addEventListener("pointerdown", onDown);
    st.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      st.removeEventListener("pointerdown", onDown);
      st.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [api]);

  if (failed) return <>{fallback}</>;

  const activeSeat = raised ? SEATS.find((s) => s.id === raised) : null;
  const shownHotspot = (id: string) => (id === "course" ? phase === "corner" : phase === "bench");

  return (
    <section ref={section} className="hall" data-ready={api ? "" : undefined} aria-labelledby="board-title">
      <div
        ref={stage}
        className="hall__stage"
        data-phase={phase}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setPinned(() => null);
            setHover(null);
            setFocus(null);
          }
        }}
      >
        <Board className="hall__board" />

        <header className="hall__copy hall__copy--floor">
          <h2 className="hall__headline">{HEADLINE}</h2>
          <p className="hall__hint">{ui.hint}</p>
        </header>
        <div className="hall__seats" role="group" aria-label={ui.chamberLabel}>
          {FLOOR.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                seatRefs.current[i] = el;
              }}
              type="button"
              className="hall__seat"
              aria-label={s.label}
              aria-pressed={pinned === s.id}
              data-dim={matches(s, filter) ? undefined : ""}
              tabIndex={phase === "floor" ? undefined : -1}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(s.id)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
              onFocus={() => setHover(s.id)}
              onBlur={() => setHover(null)}
              onClick={(e) => {
                if (dragged.current) {
                  e.preventDefault();
                  return;
                }
                setPinned((p) => (p === s.id ? null : s.id));
              }}
            />
          ))}
        </div>
        <div className="chamber__readout hall__readout" ref={readout} data-on={activeSeat && phase === "floor" ? "" : undefined} aria-live="polite">
          {activeSeat && phase === "floor" ? <Readout seat={activeSeat} /> : null}
        </div>
        <div className="hall__filters">{controls}</div>

        <header className="hall__copy hall__copy--bench">
          <h2 className="hall__subhead">{lui.parliamentaryHeading}</h2>
          <Parliament />
        </header>

        <header className="hall__copy hall__copy--corner">
          <h2 className="hall__subhead">{lui.courseHeading}</h2>
          <div className="hall__course" data-on={focus === "course" ? "" : undefined}>
            <Course titleId="course-title" />
          </div>
        </header>

        <Hotspots
          refs={hotRefs}
          items={HOTSPOTS}
          active={focus}
          shown={shownHotspot}
          label={`${lui.benchLabel}. ${lui.cornerLabel}`}
          className="hall__hotspots"
          onSelect={(id) => setFocus((f) => (f === id ? null : id))}
        />

        <p className="hall__drag" aria-hidden="true">
          {lui.dragHint}
        </p>
        <Loading engine={engine} label={lui.loading} files="13 models, hall.hdr" done={Boolean(api)} />
      </div>
    </section>
  );
}
