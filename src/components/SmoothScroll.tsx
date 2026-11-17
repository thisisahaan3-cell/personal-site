"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { ensureGsap, gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

let active: Lenis | null = null;

/** Scroll to a y position through Lenis when it runs, else natively. */
export function scrollToY(y: number, immediate = false) {
  if (active) active.scrollTo(y, { immediate, duration: 1.1 });
  else window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion() ? "instant" : "smooth" });
}

/** Lenis on long section pages (not Home, which never scrolls). Off under reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    ensureGsap();
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    active = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (active === lenis) active = null;
    };
  }, []);
  return null;
}
