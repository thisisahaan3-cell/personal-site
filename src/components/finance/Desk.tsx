"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { useSetPieceMode } from "@/lib/three/quality";
import { Hotspots } from "@/components/three/Hotspots";
import { Loading } from "@/components/three/Loading";
import { useScene } from "@/components/three/useScene";

const project = site.projects.find((p) => p.id === "artha")!;
const ui = site.ui.competitions.artha;
const fui = site.ui.finance;
const host = project.url ? new URL(project.url).host : "";
const SHOT = "/images/artha-home.webp";

/**
 * Artha (addendum §4): his site on the classic laptop's screen, on the desk under the lamp;
 * scroll dollies in to the screen. The phone screenshot rides beside it. Flat version: both
 * screenshots as images. The link to the live site is real in every version.
 */
export function Desk() {
  const mode = useSetPieceMode();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const hotRefs = useRef<(HTMLElement | null)[]>([]);
  const live = mode === "motion" || mode === "still";

  const { engine, api, failed } = useScene(live, async (e) => {
    const { buildDesk } = await import("./deskScene");
    return buildDesk(e, {
      element: stage.current!,
      section: section.current!,
      hotspots: () => hotRefs.current,
      motion: mode === "motion",
      screenshot: SHOT,
    });
  });

  // The phone screenshot drifts up against the scroll (transform only).
  useEffect(() => {
    const s = section.current;
    const p = phone.current;
    if (!s || !p || mode !== "motion") return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const t = Math.min(1, Math.max(0, -r.top / span));
      p.style.transform = `translate3d(0, ${(0.5 - t) * 12}vh, 0)`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, [mode]);

  const flat = mode === "flat" || failed;
  const copy = (
    <div className="desk__copy">
      <h2 id="artha-title" className="display-xl desk__title">
        {ui.heading}
      </h2>
      <p className="desk__text">{project.siteDescriptor?.text}</p>
      <p className="desk__note">{ui.descriptorNote}</p>
      {project.url ? (
        <a className="desk__link" href={project.url} target="_blank" rel="noopener noreferrer">
          <span>{ui.visit}</span>
          <span className="desk__host">{host}</span>
        </a>
      ) : null}
    </div>
  );
  const phoneShot = (
    <div className="desk__phone" ref={phone}>
      <Image src="/images/artha-home-mobile.webp" alt={ui.mobileAlt} width={780} height={1688} sizes="(max-width: 760px) 34vw, 240px" />
    </div>
  );

  if (flat) {
    return (
      <section className="desk desk--flat" aria-labelledby="artha-title">
        {copy}
        <div className="desk__shots">
          <Image className="desk__shot" src={SHOT} alt={ui.desktopAlt} width={2880} height={1800} sizes="(max-width: 760px) 100vw, 60vw" />
          {phoneShot}
        </div>
      </section>
    );
  }

  return (
    <section ref={section} className="desk" data-mode={mode} data-ready={api ? "" : undefined} aria-labelledby="artha-title">
      <div ref={stage} className="desk__stage">
        {copy}
        <p className="sr-only">{ui.desktopAlt}</p>
        <Hotspots
          refs={hotRefs}
          label={fui.deskLabel}
          className="desk__hotspots"
          items={[{ id: "artha", figure: fui.openArtha, line: fui.openArthaLine, href: project.url ?? undefined, reach: 64 }]}
        />
        {phoneShot}
        <Loading engine={engine} label={fui.deskLoading} files="classic-laptop.glb, wooden-table-02.glb, desk-lamp-arm-01.glb" done={Boolean(api)} />
      </div>
    </section>
  );
}
