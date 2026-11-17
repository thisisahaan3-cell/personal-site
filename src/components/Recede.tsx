"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * As the cold open scrolls away, its footage scales back and dims while the copy lifts:
 * the hand-over to the page's set piece (direction §3). Transform and opacity only.
 */
export function Recede() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>(".cold");
    if (!section || prefersReducedMotion()) return;
    ensureGsap();
    const media = section.querySelector(".footage");
    const copy = section.querySelector(".cold__copy");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });
      if (media) tl.to(media, { scale: 0.86, opacity: 0.25, ease: "none" }, 0);
      if (copy) tl.to(copy, { yPercent: -40, opacity: 0, ease: "none" }, 0);
    }, section);
    return () => ctx.revert();
  }, []);
  return <span ref={ref} hidden />;
}
