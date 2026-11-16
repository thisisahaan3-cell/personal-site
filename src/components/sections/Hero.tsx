"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "../motion/MotionProvider";

const [first, last] = site.identity.name.split(" ");

export function Hero() {
  const { ready, motion, fine } = useMotion();
  const ref = useRef<HTMLElement>(null);

  // Entrance (§5.1). Plays once per page load.
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const hero = ref.current;
    if (!hero) return;
    if (!motion) {
      root.classList.remove("pre-entrance");
      return;
    }
    if (!root.classList.contains("pre-entrance")) return;

    const words = hero.querySelectorAll(".name-word");
    const rule = hero.querySelector(".hero-rule");
    const fillet = hero.querySelector(".hero-fillet");
    const spine = hero.querySelector<HTMLElement>(".hero-spine-track .spine")!;
    const track = hero.querySelector<HTMLElement>(".hero-spine-track")!;
    const portrait = hero.querySelector(".hero-portrait picture");
    const img = hero.querySelector(".hero-portrait img");
    const desc = hero.querySelector(".hero-desc");
    const tip = hero.querySelector<HTMLElement>(".hero-tip")!;
    const bar = document.querySelector(".bar-items");
    const phone = window.innerWidth < 768;

    spine.dataset.hold = "1";
    hero.classList.add("is-entering");
    gsap.set(words, { y: 0, yPercent: 140 });
    gsap.set(rule, { scaleX: 0 });
    gsap.set(fillet, { opacity: 0 });
    gsap.set(spine, { scaleY: 0 });
    gsap.set([portrait, desc, bar], { opacity: 0 });
    gsap.set(img, { scale: 1.08 });
    gsap.set(tip, { scale: 0, opacity: 1 });
    root.classList.remove("pre-entrance");

    const trackH = track.offsetHeight;
    const target = trackH > 0 ? Math.max(0, Math.min(1, (trackH - 96) / trackH)) : 1;

    const tl = gsap.timeline({ paused: true });
    tl.to(rule, { scaleX: 1, duration: phone ? 0.7 : 0.9, ease: "mInOut" }, 0.1)
      .to(words[0], { yPercent: 0, duration: 0.8, ease: "mOut" }, 0.45)
      .to(words[1], { yPercent: 0, duration: 0.8, ease: "mOut" }, 0.57)
      .to(portrait, { opacity: 1, duration: 0.9, ease: "mOut" }, 0.7)
      .to(img, { scale: fine ? 1.06 : 1, duration: 0.9, ease: "mOut" }, 0.7)
      .set(fillet, { opacity: 1 }, phone ? 0.8 : 1.0)
      .to(spine, { scaleY: target, duration: 0.6, ease: "mInOut" }, 1.0)
      .to(desc, { opacity: 1, duration: 0.5, ease: "mOut" }, 1.3)
      .to(tip, { scale: 1, duration: 0.2, ease: "mOut" }, 1.6)
      .to(bar, { opacity: 1, duration: 0.3, ease: "mOut" }, 1.7);

    tl.eventCallback("onComplete", () => {
      spine.dataset.min = String(target);
      delete spine.dataset.hold;
      hero.classList.remove("is-entering");
      ScrollTrigger.refresh();
    });

    // Scrolling or a key press completes the sequence within 200ms.
    const hurry = () => {
      const left = tl.duration() - tl.time();
      if (left > 0.2) tl.timeScale(left / 0.2);
      if (tl.paused()) tl.play();
    };
    let tipGone = false;
    const onScroll = () => {
      hurry();
      if (!tipGone && tl.progress() === 1) {
        tipGone = true;
        gsap.to(tip, { opacity: 0, duration: 0.3 });
      }
    };
    const evts = ["wheel", "touchmove", "keydown"] as const;
    evts.forEach((e) => window.addEventListener(e, hurry, { passive: true }));
    window.addEventListener("scroll", onScroll, { passive: true });

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      tl.play();
    };
    const timer = window.setTimeout(start, 1200);
    document.fonts?.ready.then(start);

    return () => {
      window.clearTimeout(timer);
      evts.forEach((e) => window.removeEventListener(e, hurry));
      window.removeEventListener("scroll", onScroll);
      tl.progress(1).kill();
      hero.classList.remove("is-entering");
    };
  }, [ready, motion, fine]);

  // Portrait drifts inside its frame across the hero's scroll; fine pointers only (§3.0).
  useEffect(() => {
    if (!motion || !fine || !ref.current) return;
    const img = ref.current.querySelector(".hero-portrait img");
    const tween = gsap.fromTo(
      img,
      { y: -14 },
      {
        y: 14,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
      },
    );
    gsap.set(img, { scale: 1.06 });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [motion, fine]);

  const common = { alt: site.identity.portraitAlt, width: 797, height: 1060, loading: "eager" as const, fetchPriority: "high" as const };
  const {
    props: { srcSet: webp },
  } = getImageProps({ ...common, src: "/images/portrait.webp" });
  const { props: jpg } = getImageProps({ ...common, src: "/images/portrait.jpg" });

  return (
    <section id="top" ref={ref} className="hero" aria-labelledby="name">
      <h1 id="name" className="t-name">
        <span className="name-mask">
          <span className="name-word">{first}</span>
        </span>
        <span className="name-mask">
          <span className="name-word italic">{last}</span>
        </span>
      </h1>
      <span className="hero-rule" aria-hidden="true" />
      <svg className="hero-fillet" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
        <path className="ln" d="M 1 0 A 1 1 0 0 0 0 1" />
      </svg>
      <div className="hero-spine-track" aria-hidden="true">
        <span className="spine" data-spine="" />
      </div>
      <span className="mark-dot hero-tip" aria-hidden="true" />
      <p className="hero-desc t-body" data-enter="">
        {site.hero.descriptor.text}
      </p>
      {/* The frame is opaque stone from first paint and sits above the line; only the photograph fades in. */}
      <div className="hero-portrait">
        <picture data-enter="">
          <source type="image/webp" srcSet={webp ?? "/images/portrait.webp"} />
          <img {...jpg} alt={site.identity.portraitAlt} fetchPriority="high" />
        </picture>
      </div>
      <div className="hero-tail" />
    </section>
  );
}
