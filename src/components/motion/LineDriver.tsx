"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useMotion } from "./MotionProvider";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Draws the line with the scroll (§2.1). The fully drawn state is the CSS default; this only
 * sets start states when motion is allowed, and progress only increases ("drawn stays drawn").
 * The draw head sits at 70% of the viewport height.
 */
export function LineDriver() {
  const { motion, horizontal } = useMotion();

  useEffect(() => {
    if (!motion) return;
    const splits: SplitText[] = [];
    const ctx = gsap.context(() => {
      // Spine segments: scaleY from the top.
      document.querySelectorAll<HTMLElement>("[data-spine]").forEach((el) => {
        const trigger = el.parentElement;
        if (!trigger || el.closest("[data-draw-skip]")) return;
        let max = 0;
        const apply = (p: number) => {
          if (el.dataset.hold) return;
          const next = Math.max(max, p, Number(el.dataset.min || 0));
          if (next === max && max !== 0) return;
          max = next;
          gsap.set(el, { scaleY: max });
        };
        if (!el.dataset.hold) gsap.set(el, { scaleY: 0 });
        ScrollTrigger.create({
          trigger,
          start: "top 70%",
          end: "bottom 70%",
          onUpdate: (s) => apply(s.progress),
          onRefresh: (s) => apply(s.progress),
        });
      });

      // Figures: wipes, secondary fades, labels and scaled pieces.
      document.querySelectorAll<HTMLElement>("[data-figure]").forEach((fig) => {
        if (fig.closest("[data-draw-skip]")) return;
        const wipes = Array.from(fig.querySelectorAll<HTMLElement>("[data-wipe]")).map((el) => ({
          el,
          inner: el.firstElementChild as HTMLElement,
          axis: el.dataset.wipe as string,
          from: Number(el.dataset.from ?? 0),
          to: Number(el.dataset.to ?? 1),
        }));
        const fades = Array.from(fig.querySelectorAll<HTMLElement>("[data-fade]"));
        const labels = Array.from(fig.querySelectorAll<HTMLElement>("[data-at]")).map((el) => ({
          el,
          at: Number(el.dataset.at),
          shown: false,
        }));
        const scales = Array.from(fig.querySelectorAll<HTMLElement>("[data-scale]")).map((el) => ({
          el,
          axis: el.dataset.scale as string,
          from: Number(el.dataset.from ?? 0),
          to: Number(el.dataset.to ?? 1),
        }));
        let max = -1;
        const apply = (p: number) => {
          if (p <= max) return;
          max = p;
          for (const w of wipes) {
            const q = clamp((p - w.from) / (w.to - w.from || 1));
            const off = (1 - q) * 100;
            if (w.axis === "x") {
              gsap.set(w.el, { xPercent: -off });
              gsap.set(w.inner, { xPercent: off });
            } else if (w.axis === "-x") {
              gsap.set(w.el, { xPercent: off });
              gsap.set(w.inner, { xPercent: -off });
            } else if (w.axis === "y") {
              gsap.set(w.el, { yPercent: -off });
              gsap.set(w.inner, { yPercent: off });
            } else {
              gsap.set(w.el, { yPercent: off });
              gsap.set(w.inner, { yPercent: -off });
            }
          }
          for (const s of scales) {
            const q = clamp((p - s.from) / (s.to - s.from || 1));
            if (s.axis === "y") gsap.set(s.el, { scaleY: q });
            else gsap.set(s.el, { scaleX: q });
          }
          const fo = clamp(p / 0.3);
          for (const f of fades) gsap.set(f, { opacity: fo });
          let i = 0;
          for (const l of labels) {
            if (!l.shown && p >= l.at) {
              l.shown = true;
              gsap.to(l.el, { opacity: 1, duration: 0.3, delay: 0.06 * i++, ease: "mOut" });
            }
          }
        };
        gsap.set(
          labels.map((l) => l.el),
          { opacity: 0 },
        );
        apply(0);
        ScrollTrigger.create({
          trigger: fig,
          start: "top 70%",
          end: "bottom 70%",
          onUpdate: (s) => apply(s.progress),
          onRefresh: (s) => apply(s.progress),
        });
      });

      // Things that appear when the head passes them (ticks, end dots).
      document.querySelectorAll<HTMLElement>("[data-appear]").forEach((el) => {
        if (el.closest("[data-draw-skip]")) return;
        gsap.set(el, { opacity: 0 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          once: true,
          onEnter: () => gsap.to(el, { opacity: 1, duration: 0.15, ease: "none" }),
        });
      });

      // Chapter titles: each line rises from behind its own mask, once (§2.3).
      document.querySelectorAll<HTMLElement>("[data-title]").forEach((el) => {
        if (el.closest("[data-draw-skip]")) return;
        let done = false;
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "tline",
          autoSplit: true,
          onSplit(self) {
            if (!done) gsap.set(self.lines, { yPercent: 130 });
          },
        });
        splits.push(split);
        ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          once: true,
          onEnter: () => {
            gsap.to(split.lines, {
              yPercent: 0,
              duration: 0.8,
              ease: "mOut",
              stagger: 0.08,
              onComplete: () => {
                done = true;
                split.revert();
              },
            });
          },
        });
      });

      // Night: the ground wipes across from the meridian side; Law's stone wipes back (§5.2).
      const wideEnough = window.matchMedia("(min-width: 768px), (pointer: fine)").matches;
      if (wideEnough) {
        for (const sel of [".night-ground", ".stone-ground"]) {
          const ground = document.querySelector<HTMLElement>(sel);
          const block = ground?.parentElement;
          if (!ground || !block) continue;
          let max = 0;
          gsap.set(ground, { scaleX: 0 });
          ScrollTrigger.create({
            trigger: block,
            start: "top bottom",
            end: "top 40%",
            onUpdate: (s) => {
              if (s.progress > max) {
                max = s.progress;
                gsap.set(ground, { scaleX: max });
              }
            },
            onRefresh: (s) => {
              max = Math.max(max, s.progress);
              gsap.set(ground, { scaleX: max });
            },
          });
        }
      }
    });

    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    return () => {
      splits.forEach((s) => s.revert());
      ctx.revert();
    };
  }, [motion, horizontal]);

  return null;
}
