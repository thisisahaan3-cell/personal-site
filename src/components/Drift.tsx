"use client";

import { useEffect, useRef } from "react";
import { ensureGsap, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A framed media box whose contents drift slowly against the scroll (restrained parallax).
 * The frame stays put; only the inner layer moves, by transform. Off under reduced motion.
 */
export function Drift({
  className,
  amount = 8,
  children,
}: {
  className?: string;
  amount?: number;
  children: React.ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = frame.current;
    const i = inner.current;
    if (!f || !i || prefersReducedMotion()) return;
    ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        i,
        { yPercent: -amount / 2 },
        { yPercent: amount / 2, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } },
      );
    }, f);
    return () => ctx.revert();
  }, [amount]);
  return (
    <div ref={frame} className={`drift ${className ?? ""}`} aria-hidden="true">
      <div ref={inner} className="drift__inner" style={{ ["--drift" as string]: `${amount}%` }}>
        {children}
      </div>
    </div>
  );
}
