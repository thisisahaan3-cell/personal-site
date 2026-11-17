"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { useSetPieceMode } from "@/lib/three/quality";
import { Hotspots, type HotspotItem } from "@/components/three/Hotspots";
import { Loading } from "@/components/three/Loading";
import { pointerNdcOf } from "@/components/three/pointer";
import { useScene } from "@/components/three/useScene";
import { RESULTS, type Result } from "./results";
import type { BronzeApi } from "./bronzeScene";

const ui = site.ui.finance;

/** Label placement per result: horn tips up and out, the brow out to the right, the muzzle down-left. */
const PLACE: Record<string, Pick<HotspotItem, "side" | "reach" | "rise">> = {
  nfo: { side: "right", reach: 80, rise: 14 },
  srcc: { side: "left", reach: 80, rise: 14 },
  fellowship: { side: "right", reach: 190, rise: -12 },
  shisfest: { side: "left", reach: 130, rise: -32 },
};

const ITEMS: HotspotItem[] = RESULTS.map((r) => ({
  id: r.id,
  figure: r.figure,
  line: r.line,
  sub: r.sub,
  ...PLACE[r.id],
}));

/**
 * "The bronze" (addendum §4): the Finance set piece. A pinned scroll scene in the page's single
 * WebGL renderer; the four results are real buttons anchored to the bull head. Flat version
 * (no WebGL2, save-data, a failed load): the still, if there is one, and the same four results
 * as a list.
 */
export function Bronze({ still }: { still: string | null }) {
  const mode = useSetPieceMode();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hotRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const live = mode === "motion" || mode === "still";

  const { engine, api, failed } = useScene<BronzeApi>(live, async (e) => {
    const { buildBronze } = await import("./bronzeScene");
    return buildBronze(e, {
      element: stage.current!,
      section: section.current!,
      hotspots: () => hotRefs.current,
      ids: RESULTS.map((r) => r.id),
      motion: mode === "motion",
    });
  });

  // The pointer is the torch (and turns the head).
  useEffect(() => {
    const el = stage.current;
    if (!el || !api || mode !== "motion") return;
    const move = (e: PointerEvent) => api.pointer(pointerNdcOf(e, el));
    const leave = () => api.pointer(null);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointercancel", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointercancel", leave);
    };
  }, [api, mode]);

  useEffect(() => {
    api?.focus(active);
  }, [api, active]);

  const flat = mode === "flat" || failed;
  const current = RESULTS.find((r) => r.id === active) ?? null;

  if (flat) {
    return (
      <section className="bronze bronze--flat" aria-labelledby="bronze-title">
        {still ? (
          <div className="bronze__still">
            <Image src={still} alt="" fill sizes="100vw" />
          </div>
        ) : null}
        <header className="bronze__copy">
          <h2 id="bronze-title" className="display-l bronze__title">
            {ui.bronzeHeading}
          </h2>
        </header>
        <ol className="bronze__list">
          {RESULTS.map((r) => (
            <li key={r.id} className="bronze__row">
              <Panel r={r} />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section
      ref={section}
      className="bronze"
      data-mode={mode}
      data-ready={api ? "" : undefined}
      aria-labelledby="bronze-title"
    >
      <div
        ref={stage}
        className="bronze__stage"
        onKeyDown={(e) => {
          if (e.key === "Escape") setActive(null);
        }}
      >
        <header className="bronze__copy">
          <h2 id="bronze-title" className="display-l bronze__title">
            {ui.bronzeHeading}
          </h2>
          <p className="bronze__intro">
            <span className="bronze__intro--fine">{ui.bronzeIntro}</span>
            <span className="bronze__intro--touch">{ui.bronzeIntroTouch}</span>
          </p>
        </header>

        <Hotspots
          refs={hotRefs}
          items={ITEMS}
          active={active}
          label={ui.bronzeLabel}
          className="bronze__hotspots"
          onSelect={(id) => setActive((a) => (a === id ? null : id))}
        />

        <div className="bronze__panel" aria-live="polite" data-on={current ? "" : undefined}>
          {current ? (
            <>
              <Panel r={current} />
              <button type="button" className="bronze__close" onClick={() => setActive(null)}>
                {ui.panelClose}
              </button>
            </>
          ) : null}
        </div>

        <Loading engine={engine} label={ui.bronzeLoading} files="bull-head.glb, hall.hdr" done={Boolean(api)} />
      </div>
    </section>
  );
}

function Panel({ r }: { r: Result }) {
  return (
    <div className="result">
      <p className="result__figure">{r.figure}</p>
      <h3 className="result__title">
        {r.title}
        {r.year ? <span className="result__year">{r.year}</span> : null}
      </h3>
      {r.lines.map((l) => (
        <p key={l} className="result__line">
          {l}
        </p>
      ))}
      {r.note ? <p className="result__note">{r.note}</p> : null}
    </div>
  );
}
