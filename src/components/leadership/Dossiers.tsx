"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { site } from "@/content/site";
import { fill, shown } from "@/lib/content";
import { useSetPieceMode } from "@/lib/three/quality";
import { Loading } from "@/components/three/Loading";
import { pointerNdcOf } from "@/components/three/pointer";
import { useScene } from "@/components/three/useScene";
import { scrollToY } from "@/components/SmoothScroll";
import { ENTRIES, type WorkEntry } from "./entries";

const ui = site.ui.work;
const N = ENTRIES.length;

/**
 * The set piece of Leadership & Work Experience: seven dossiers flying through window light,
 * each opening in turn (full motion, phones included). Reduced motion and no-WebGL get the
 * same entries as a stacked file drawer. Every entry is real DOM text in both versions.
 */
export function Dossiers({ video }: { video: string | null }) {
  const mode = useSetPieceMode();
  const live = mode === "motion";
  return live ? <Flight video={video} /> : <Drawer />;
}

function Entry({ e, headingLevel = 3 }: { e: WorkEntry; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <>
      <p className="dossier__org">{e.organisation}</p>
      <H className="dossier__title">{e.title}</H>
      <p className="dossier__period">{shown(e.period)}</p>
      <ul className="dossier__points">
        {e.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </>
  );
}

/** Fallback: the entries as a file drawer, each tab set a little further along. */
function Drawer() {
  return (
    <section className="drawer" aria-labelledby="dossiers-title">
      <h2 id="dossiers-title" className="drawer__title">
        {ui.internshipsHeading}
      </h2>
      <ol className="drawer__list">
        {ENTRIES.map((e, i) => (
          <li key={e.id} className="drawer__file" data-kind={e.kind} style={{ ["--i" as string]: i }}>
            {i === site.work.internships.length ? <p className="drawer__group">{ui.leadershipHeading}</p> : null}
            <span className="drawer__tab" aria-hidden="true">
              {e.label}
            </span>
            <div className="drawer__sheet">
              <Entry e={e} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Flight({ video }: { video: string | null }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { engine, api, failed } = useScene(true, async (e) => {
    const { buildDossiers } = await import("./dossierScene");
    return buildDossiers(e, {
      element: stage.current!,
      section: section.current!,
      entries: ENTRIES,
      video,
      motion: true,
      onActive: setActive,
    });
  });

  /** Scroll so entry i is open (s = i + 0.55 in the scene's scroll units). */
  const go = (i: number) => {
    const s = section.current;
    if (!s) return;
    const k = Math.max(0, Math.min(N - 1, i));
    const p = (k + 0.55 + 0.15) / (N + 0.25);
    const top = s.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (s.offsetHeight - window.innerHeight) * p);
  };

  const e = ENTRIES[active];
  if (failed) return <Drawer />;
  const group = e.kind === "internship" ? ui.internshipsHeading : ui.leadershipHeading;

  return (
    <section ref={section} className="dossiers" data-ready={api ? "" : undefined} aria-labelledby="dossiers-title">
      <div
        ref={stage}
        className="dossiers__stage"
        onPointerMove={(ev) => {
          if (ev.pointerType !== "mouse" || !stage.current) return;
          const p = pointerNdcOf(ev, stage.current);
          api?.pointer(p.x, p.y);
        }}
        onPointerLeave={() => api?.pointer(0, 0)}
        onKeyDown={(ev) => {
          if (ev.key === "ArrowRight" || ev.key === "ArrowDown") {
            ev.preventDefault();
            go(active + 1);
          } else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") {
            ev.preventDefault();
            go(active - 1);
          }
        }}
      >
        <div className="dossiers__copy">
          <h2 id="dossiers-title" className="dossiers__group">
            {group}
          </h2>
          <div className="dossiers__entry" key={e.id} aria-live="polite">
            <Entry e={e} />
          </div>
          <p className="dossiers__hint">{ui.hint}</p>
        </div>

        <nav className="dossiers__index" aria-label={ui.filesLabel}>
          <p className="dossiers__count" aria-hidden="true">
            {fill(ui.counter, { n: active + 1, total: N })}
          </p>
          <ol>
            {ENTRIES.map((x, i) => (
              <li key={x.id}>
                <button type="button" className="dossiers__pick" data-kind={x.kind} aria-current={i === active ? "true" : undefined} onClick={() => go(i)}>
                  {x.label}
                </button>
              </li>
            ))}
          </ol>
          <div className="dossiers__steps">
            <button type="button" className="dossiers__step" onClick={() => go(active - 1)} disabled={active === 0} aria-label={ui.previous}>
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
            <button type="button" className="dossiers__step" onClick={() => go(active + 1)} disabled={active === N - 1} aria-label={ui.next}>
              <ChevronRight aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </div>
        </nav>

        <Loading engine={engine} label={ui.loading} files="interior-warm.hdr" done={Boolean(api)} />
      </div>
    </section>
  );
}
