"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

let registered = false;

export function ensureGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("mOut", "M0,0 C0.22,1 0.36,1 1,1");
  CustomEase.create("mInOut", "M0,0 C0.65,0 0.35,1 1,1");
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

/** cubic-bezier(0.65, 0, 0.35, 1) as a plain function, for Lenis. */
export function easeInOut(t: number) {
  // Newton iterations on the bezier x(t) to find the parameter, then y.
  const x1 = 0.65,
    y1 = 0,
    x2 = 0.35,
    y2 = 1;
  const bx = (u: number) => 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u * u * (1 - u) + u ** 3;
  const by = (u: number) => 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u * u * (1 - u) + u ** 3;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const d = (bx(u + 1e-4) - bx(u - 1e-4)) / 2e-4 || 1;
    u -= (bx(u) - t) / d;
    u = Math.min(1, Math.max(0, u));
  }
  return by(u);
}

export { gsap, ScrollTrigger, SplitText };
