"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { GROUND_HEX, pageForPath, pageName } from "@/lib/pages";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Page transition (direction §7): 96 candle columns rise left to right to cover the screen,
 * a split-flap line settles on the destination name, the columns drop to reveal the page.
 * 900ms in all. Reduced motion: a 150ms cross-fade. Only transform and opacity animate.
 */

type Phase = "idle" | "running";
type Ctx = { navigate: (href: string) => void; phase: Phase };
const TransitionContext = createContext<Ctx>({ navigate: () => {}, phase: "idle" });
export const useTransitionPhase = () => useContext(TransitionContext).phase;

const COLS = 96;
const GLIDE = "cubic-bezier(0.16, 1, 0.3, 1)";
const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Seeded random walk so the columns' leading edges read as one price series. */
function series() {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let v = 0;
  return Array.from({ length: COLS }, () => {
    const prev = v;
    v = Math.max(-1, Math.min(1, v + (rnd() - 0.5) * 0.7));
    return { up: v >= prev, lag: (v + 1) / 2, body: 14 + Math.round(rnd() * 26) };
  });
}
const SERIES = series();

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const busy = useRef(false);
  const overlay = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const pathWaiter = useRef<{ href: string; resolve: () => void } | null>(null);

  useEffect(() => {
    const w = pathWaiter.current;
    if (w && pageForPath(pathname).href === pageForPath(w.href).href) {
      pathWaiter.current = null;
      // Let the new page paint before the columns drop.
      requestAnimationFrame(() => requestAnimationFrame(w.resolve));
    }
  }, [pathname]);

  const runFlap = useCallback(async (name: string) => {
    const el = flap.current;
    if (!el) return;
    el.replaceChildren();
    const cells = Array.from(name).map((ch) => {
      const c = document.createElement("span");
      c.className = ch === " " ? "flap__cell flap__cell--space" : "flap__cell";
      c.textContent = ch === " " ? " " : FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
      el.appendChild(c);
      return { c, ch };
    });
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 90, fill: "forwards" });
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const t = performance.now() - start;
        let done = true;
        cells.forEach(({ c, ch }, i) => {
          if (ch === " ") return;
          const settleAt = 140 + i * 26;
          if (t < settleAt) {
            done = false;
            if (Math.random() < 0.6) {
              c.textContent = FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
              c.animate([{ transform: "scaleY(0.2)" }, { transform: "scaleY(1)" }], { duration: 60, easing: GLIDE });
            }
          } else if (c.textContent !== ch) {
            c.textContent = ch;
            c.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], {
              duration: 160,
              easing: "cubic-bezier(0.2, 1.3, 0.3, 1)",
            });
          }
        });
        if (done) resolve();
        else setTimeout(tick, 42);
      };
      tick();
    });
  }, []);

  const navigate = useCallback(
    async (href: string) => {
      const target = pageForPath(href);
      const here = pageForPath(pathname);
      if (busy.current || target.href === here.href) return;
      const root = overlay.current;
      if (!root) {
        router.push(href);
        return;
      }
      busy.current = true;
      setPhase("running");
      root.style.setProperty("--tx-ground", GROUND_HEX[target.ground]);
      root.dataset.active = "true";
      const arrived = new Promise<void>((resolve) => {
        pathWaiter.current = { href, resolve };
      });

      try {
        if (prefersReducedMotion()) {
          const fade = root.querySelector<HTMLElement>(".tx__fade")!;
          await fade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: "forwards" }).finished;
          router.push(href);
          await Promise.race([arrived, wait(2000)]);
          await fade.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" }).finished;
        } else {
          await cover(root);
          router.push(href);
          await Promise.all([runFlap(pageName(target.id)), Promise.race([arrived, wait(2500)])]);
          await reveal(root);
        }
      } finally {
        if (flap.current) flap.current.replaceChildren();
        root.querySelectorAll<HTMLElement>(".tx__fade").forEach((el) =>
          el.getAnimations().forEach((a) => a.cancel()),
        );
        delete root.dataset.active;
        busy.current = false;
        setPhase("idle");
      }
    },
    [pathname, router, runFlap],
  );

  const value = useMemo(() => ({ navigate, phase }), [navigate, phase]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <div className="tx" ref={overlay} aria-hidden="true">
        <div className="tx__cols">
          {SERIES.map((s, i) => (
            <i
              key={i}
              className="tx__col"
              data-up={s.up ? "" : undefined}
              style={{ ["--body" as string]: `${s.body}px` }}
            />
          ))}
        </div>
        <div className="tx__flap" ref={flap} />
        <div className="tx__fade" />
      </div>
    </TransitionContext.Provider>
  );
}

function columns(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(".tx__col"));
}

async function cover(root: HTMLElement) {
  const cols = columns(root);
  const anims = cols.map((c, i) =>
    c.animate(
      [{ transform: "translateY(calc(100% + 48px))" }, { transform: "translateY(0)" }],
      { duration: 230, delay: i * 0.9 + SERIES[i].lag * 22, easing: GLIDE, fill: "forwards" },
    ),
  );
  await Promise.all(anims.map((a) => a.finished));
}

async function reveal(root: HTMLElement) {
  const cols = columns(root);
  const flapEl = root.querySelector<HTMLElement>(".tx__flap");
  flapEl?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: "forwards" });
  const anims = cols.map((c, i) =>
    c.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(calc(100% + 48px))" }],
      { duration: 260, delay: i * 0.9 + (1 - SERIES[i].lag) * 22, easing: "cubic-bezier(0.7, 0, 0.84, 0)", fill: "forwards" },
    ),
  );
  await Promise.all(anims.map((a) => a.finished));
  cols.forEach((c) => c.getAnimations().forEach((a) => a.cancel()));
  root.querySelectorAll<HTMLElement>(".tx__flap, .tx__fade").forEach((el) =>
    el.getAnimations().forEach((a) => a.cancel()),
  );
}

/** A link that plays the page transition on client-side navigation. */
export function TransitionLink(props: ComponentProps<typeof Link>) {
  const { navigate } = useContext(TransitionContext);
  const { onNavigate, href, ...rest } = props;
  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(e) => {
        onNavigate?.(e);
        e.preventDefault();
        navigate(typeof href === "string" ? href : String(href.pathname ?? "/"));
      }}
    />
  );
}
