"use client";

import { useRef, useState } from "react";
import { site } from "@/content/site";
import { fill } from "@/lib/content";
import { useSetPieceMode } from "@/lib/three/quality";
import { Hotspots, type HotspotItem } from "@/components/three/Hotspots";
import { Loading } from "@/components/three/Loading";
import { pointerNdcOf } from "@/components/three/pointer";
import { useScene } from "@/components/three/useScene";

const ui = site.ui.academicsPage;
const top = site.academics.schoolTopper;
const gx = site.education.gradeX;
const GRADES = Array.from({ length: top.everyYear.toGrade - top.everyYear.fromGrade + 1 }, (_, i) => top.everyYear.fromGrade + i);

/** One hotspot per lifted volume; Grade 10 carries the CBSE result. Rise alternates so labels clear each other. */
const ITEMS: HotspotItem[] = GRADES.map((g, k) => {
  const grade = fill(ui.gradeLabel, { n: g });
  if (g === 10)
    return { id: `g${g}`, figure: gx.score, line: `${grade}, ${ui.topperLine.toLowerCase()}`, sub: gx.exam, side: "right", reach: 96, rise: 30 };
  const LAYOUT: [HotspotItem["side"], number, number][] = [
    ["left", 60, 40],
    ["left", 70, -34],
    ["left", 120, 62],
    ["right", 110, 24],
    ["right", 64, -40],
  ];
  const [side, reach, rise] = LAYOUT[k];
  return { id: `g${g}`, figure: grade, line: ui.topperLine, side, reach, rise };
});

/**
 * School topper (addendum §4, "The desk"): the record in the DOM on the left, the desk in dusk
 * light on the right, one volume lifted from the encyclopedia set for each year from Grade 7
 * to Grade 11. The year row in the DOM lights as each volume rises; it is also the flat version.
 */
export function Topper() {
  const mode = useSetPieceMode();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hotRefs = useRef<(HTMLElement | null)[]>([]);
  const [lifted, setLifted] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const live = mode === "motion" || mode === "still";

  const { engine, api, failed } = useScene(live, async (e) => {
    const { buildTopper } = await import("./deskScene");
    return buildTopper(e, {
      element: stage.current!,
      section: section.current!,
      hotspots: () => hotRefs.current,
      motion: mode === "motion",
      onLifted: setLifted,
    });
  });

  const flat = mode === "flat" || failed;
  // Hotspots appear in lift order: 7, 8, 9, 11, then 10.
  const order = [7, 8, 9, 11, 10];
  const shown = (id: string) => order.indexOf(Number(id.slice(1))) < lifted;
  const lit = (g: number) => flat || mode === "pending" || order.indexOf(g) < lifted;

  const copy = (
    <div className="topper__copy">
      <h2 id="topper-title" className="topper__kicker">
        {ui.schoolTopperHeading}
      </h2>
      <p className="display-l topper__statement">{top.everyYear.text}</p>
      <ol className="topper__years" aria-label={ui.gradesLabel}>
        {GRADES.map((g) => (
          <li key={g} className="topper__year" data-lit={lit(g) ? "" : undefined} data-key={g === 10 ? "" : undefined}>
            <span className="topper__grade">{g}</span>
            <span className="topper__year-label">{fill(ui.gradeLabel, { n: g })}</span>
          </li>
        ))}
      </ol>
      <p className="topper__line">
        <span className="topper__score">{gx.score}</span>
        <span>{top.grade10.text}</span>
      </p>
      <p className="topper__note">{gx.extras.filter((x) => !/topper/i.test(x)).join(", ")}</p>
      <p className="topper__note">{top.current.text}</p>
      {!flat ? <p className="topper__hint">{ui.deskHint}</p> : null}
    </div>
  );

  if (flat) {
    return (
      <section className="topper topper--flat" aria-labelledby="topper-title">
        {copy}
      </section>
    );
  }

  return (
    <section ref={section} className="topper" data-mode={mode} data-ready={api ? "" : undefined} aria-labelledby="topper-title">
      <div
        ref={stage}
        className="topper__stage"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !stage.current) return;
          const p = pointerNdcOf(e, stage.current);
          api?.pointer(p.x, p.y);
        }}
        onPointerLeave={() => api?.pointer(0, 0)}
      >
        {copy}
        <Hotspots
          refs={hotRefs}
          items={ITEMS}
          active={active}
          shown={shown}
          label={ui.deskLabel}
          className="topper__hotspots"
          onSelect={(id) => setActive((a) => (a === id ? null : id))}
        />
        <Loading engine={engine} label={ui.deskLoading} files="school-desk-01.glb, school-chair-01.glb, book-encyclopedia-set-01.glb" done={Boolean(api)} />
      </div>
    </section>
  );
}
