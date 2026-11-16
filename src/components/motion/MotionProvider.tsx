"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { easeInOut, ensureGsap, gsap, ScrollTrigger } from "@/lib/gsap";

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

type MotionCtx = {
  /** True once mounted in the browser. */
  ready: boolean;
  /** Motion allowed (no reduced-motion preference). */
  motion: boolean;
  /** Fine pointer with hover. */
  fine: boolean;
  /** The horizontal pinned timeline is in use (§4.1 conditions). */
  horizontal: boolean;
  scrollToId: (id: string) => void;
  scrollToY: (y: number, duration?: number) => void;
  stopScroll: (stop: boolean) => void;
};

const Ctx = createContext<MotionCtx>({
  ready: false,
  motion: false,
  fine: false,
  horizontal: false,
  scrollToId: () => {},
  scrollToY: () => {},
  stopScroll: () => {},
});

export const useMotion = () => useContext(Ctx);

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const fine = useMedia("(pointer: fine) and (hover: hover)");
  const horizontalMq = useMedia(
    "(min-width: 1100px) and (min-height: 680px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  const [ready, setReady] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const motion = ready && !reduced;
  const horizontal = ready && horizontalMq;

  useEffect(() => {
    ensureGsap();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag for browser-only behaviour
    setReady(true);
  }, []);

  // Lenis only with a fine pointer and motion allowed (§2.2). Touch uses native scrolling.
  useEffect(() => {
    if (!ready || reduced || !fine) return;
    const lenis = new Lenis({ autoRaf: false, anchors: false });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [ready, reduced, fine]);

  // Fonts change line lengths; recompute every scroll position once they are in.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
    };
  }, [ready]);

  const scrollToY = useCallback((y: number, duration?: number) => {
    const lenis = lenisRef.current;
    if (lenis) {
      const dist = Math.abs(y - window.scrollY);
      lenis.scrollTo(y, {
        duration: duration ?? Math.min(1.4, 0.4 + dist / 6000),
        easing: easeInOut,
        force: true,
      });
    } else {
      window.scrollTo({ top: y, behavior: "instant" });
    }
  }, []);

  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      // A pinned section is wrapped in a spacer; measure the spacer so the target is where the pin starts.
      const anchor = (el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el) as HTMLElement;
      const y = anchor.getBoundingClientRect().top + window.scrollY - 24;
      scrollToY(Math.max(0, y));
      history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
    },
    [scrollToY],
  );

  const stopScroll = useCallback((stop: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (stop) lenis.stop();
      else lenis.start();
    }
    document.documentElement.style.overflow = stop ? "hidden" : "";
  }, []);

  const value = useMemo(
    () => ({ ready, motion, fine: ready && fine, horizontal, scrollToId, scrollToY, stopScroll }),
    [ready, motion, fine, horizontal, scrollToId, scrollToY, stopScroll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
