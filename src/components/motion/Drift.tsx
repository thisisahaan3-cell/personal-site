"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "./MotionProvider";

/** Moves its child up to `range` px against the scroll. Fine pointers with motion only. */
export function Drift({ children, range = 40, className = "" }: { children: ReactNode; range?: number; className?: string }) {
  const { motion, fine } = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!motion || !fine || !ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { y: range / 2 },
      {
        y: -range / 2,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.revert();
    };
  }, [motion, fine, range]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
