"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { useSetPieceMode } from "@/lib/three/quality";
import { Loading } from "@/components/three/Loading";
import { pointerNdcOf } from "@/components/three/pointer";
import { useScene } from "@/components/three/useScene";

const page = site.interestsPage;
const ui = site.ui.interests;
const ITEMS = page.items;
const IDS = ITEMS.map((i) => i.id);
const N = ITEMS.length;
const PHONE_MAX = 760;

/** Object colours (design/v2.1-addendum.md §2); also in globals.css as --aviation etc. */
const COLOURS: Record<string, string> = {
  aviation: "#7fb2ff",
  reading: "#e6a06a",
  formula1: "#ff4a3d",
  tennis: "#d7f23a",
};

/**
 * The Interests set piece. Desktop with full motion: the turntable. Phones, reduced motion,
 * no WebGL or a failed load: the same four interests and facts as a designed list.
 */
export function Interests() {
  const mode = useSetPieceMode();
  const [phone, setPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${PHONE_MAX - 1}px)`);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const live = mode === "motion" && phone === false;
  return live ? <Turntable /> : <List />;
}

function Facts({ facts }: { facts: { text: string }[] }) {
  return (
    <ul className="interest__facts">
      {facts.map((f) => (
        <li key={f.text}>{f.text}</li>
      ))}
    </ul>
  );
}

/** Fallback: the four interests as a list, each name in its own colour. */
function List() {
  return (
    <section className="ilist" aria-labelledby="page-title">
      <h1 id="page-title" className="ilist__title">
        {site.ui.pages.interests}
      </h1>
      <ul className="ilist__items" aria-label={ui.listHeading}>
        {ITEMS.map((it) => (
          <li key={it.id} className="ilist__row" data-interest={it.id}>
            <h2 className="ilist__name">{it.name}</h2>
            <Facts facts={it.facts} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Turntable() {
  const stage = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(0);
  const [hovering, setHovering] = useState(false);

  const { engine, api, failed } = useScene(true, async (e) => {
    const { buildTurntable } = await import("./turntableScene");
    return buildTurntable(e, { element: stage.current!, ids: IDS, colours: COLOURS, initial: 0 });
  });

  const choose = (i: number) => {
    const k = ((i % N) + N) % N;
    setSel(k);
    api?.select(k);
  };

  if (failed) return <List />;
  const it = ITEMS[sel];

  return (
    <section className="turntable" data-interest={it.id} data-ready={api ? "" : undefined} aria-labelledby="page-title">
      <div
        ref={stage}
        className="turntable__stage"
        data-hover={hovering ? "" : undefined}
        onPointerMove={(ev) => {
          if (!stage.current || !api) return;
          const p = pointerNdcOf(ev, stage.current);
          if (ev.pointerType === "mouse") api.pointer(p.x, p.y);
          const over = api.pick(p.x, p.y) >= 0;
          if (over !== hovering) setHovering(over);
        }}
        onPointerLeave={() => {
          api?.pointer(0, 0);
          setHovering(false);
        }}
        onClick={(ev) => {
          if (!stage.current || !api) return;
          if ((ev.target as HTMLElement).closest("button, a")) return;
          const p = pointerNdcOf(ev, stage.current);
          const i = api.pick(p.x, p.y);
          if (i >= 0) choose(i);
        }}
      >
        <div className="turntable__copy">
          <h1 id="page-title" className="turntable__title">
            {site.ui.pages.interests}
          </h1>
          <div className="turntable__entry" key={it.id} aria-live="polite">
            <h2 className="turntable__word">{it.name}</h2>
            <Facts facts={it.facts} />
          </div>
        </div>

        <div
          className="turntable__controls"
          role="group"
          aria-label={ui.choose}
          onKeyDown={(ev) => {
            if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
              ev.preventDefault();
              choose(sel + 1);
              (ev.currentTarget.querySelectorAll<HTMLButtonElement>(".turntable__pick")[(sel + 1) % N])?.focus();
            } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
              ev.preventDefault();
              choose(sel - 1);
              (ev.currentTarget.querySelectorAll<HTMLButtonElement>(".turntable__pick")[(sel - 1 + N) % N])?.focus();
            }
          }}
        >
          <ul className="turntable__picks">
            {ITEMS.map((x, i) => (
              <li key={x.id}>
                <button
                  type="button"
                  className="turntable__pick"
                  data-interest={x.id}
                  aria-pressed={i === sel}
                  onClick={() => choose(i)}
                >
                  {x.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="turntable__steps">
            <button type="button" className="turntable__step" onClick={() => choose(sel - 1)} aria-label={ui.previous}>
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
            <button type="button" className="turntable__step" onClick={() => choose(sel + 1)} aria-label={ui.next}>
              <ChevronRight aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </div>
          <p className="turntable__hint">{ui.hint}</p>
        </div>

        <Loading engine={engine} label={ui.loading} files="studio.hdr" done={Boolean(api)} />
      </div>
    </section>
  );
}
