"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { ensureGsap, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

const project = site.projects.find((p) => p.id === "artha")!;
const ui = site.ui.competitions.artha;
const host = project.url ? new URL(project.url).host : "";

/**
 * Artha: his own site, shown as it is. Desktop screenshot at full bleed, the phone screenshot
 * overlapping it, both on slow scroll parallax at different rates (transform only).
 */
export function Artha() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    ensureGsap();
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo(".artha__desk-img", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: st });
      gsap.fromTo(".artha__phone", { yPercent: 18 }, { yPercent: -22, ease: "none", scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="artha" aria-labelledby="artha-title">
      <div className="artha__copy">
        <h2 id="artha-title" className="display-xl artha__title">
          {ui.heading}
        </h2>
        <div className="artha__about">
          <p className="artha__text">{project.siteDescriptor?.text}</p>
          <p className="artha__note">{ui.descriptorNote}</p>
          {project.url ? (
            <a className="artha__link" href={project.url} target="_blank" rel="noopener noreferrer">
              <span>{ui.visit}</span>
              <span className="artha__host">{host}</span>
            </a>
          ) : null}
        </div>
      </div>
      <div className="artha__shots">
        <div className="artha__desk">
          <Image
            className="artha__desk-img"
            src="/images/artha-home.webp"
            alt={ui.desktopAlt}
            width={2880}
            height={1800}
            sizes="100vw"
          />
        </div>
        <div className="artha__phone">
          <Image src="/images/artha-home-mobile.webp" alt={ui.mobileAlt} width={780} height={1688} sizes="(max-width: 760px) 40vw, 300px" />
        </div>
      </div>
    </section>
  );
}
