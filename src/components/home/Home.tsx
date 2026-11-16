"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { DESTINATIONS, statFor } from "@/lib/pages";
import { prefersReducedMotion, prefersStillMedia } from "@/lib/motion";
import { TransitionLink, useTransitionPhase } from "@/components/shell/Transition";
import { Roll } from "./Roll";
import { photoUnderStill, placePortrait } from "./composition";
import { CandleWall, type Rect, type WallLayout } from "./wall";

const MATTE = "/images/portrait-matte.webp";
const TONE = "/images/portrait-tone.webp";
const STILL_SRC = "/images/portrait-candles.webp";
const PHONE_MAX = 760;

type Mode = "pending" | "webgl" | "still";

const toRect = (r: DOMRect): Rect => ({ x: r.left, y: r.top, w: r.width, h: r.height });

function loadImage(src: string) {
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
  return img.decode().then(() => img);
}

export function Home({ video }: { video: string | null }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const lensImg = useRef<HTMLDivElement>(null);
  const crossH = useRef<HTMLDivElement>(null);
  const crossV = useRef<HTMLDivElement>(null);
  const wall = useRef<CandleWall | null>(null);
  const imageRect = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [mode, setMode] = useState<Mode>("pending");
  const modeRef = useRef<Mode>("pending");
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  const [playing, setPlaying] = useState(false);
  const [wallReady, setWallReady] = useState(false);
  const phase = useTransitionPhase();

  const measure = useCallback((): WallLayout | null => {
    const f = frame.current;
    const c = canvas.current;
    if (!f || !c) return null;
    const view = { w: c.clientWidth || window.innerWidth, h: c.clientHeight || window.innerHeight };
    const phone = view.w < PHONE_MAX;
    const fr = toRect(f.getBoundingClientRect());
    const image = placePortrait(fr, phone);
    // The lens maps onto the photograph under whatever is showing: the wall, or the still.
    imageRect.current = modeRef.current === "still" ? photoUnderStill(fr) : image;
    const footTop = foot.current?.getBoundingClientRect().top ?? view.h;
    return {
      view,
      frame: fr,
      image,
      backdropGrid: phone ? [60, 100] : [160, 90],
      portraitGrid: phone ? [56, 75] : [96, 128],
      footY: footTop,
      clipY: phone ? fr.y + fr.h : view.h + image.h,
      phone,
    };
  }, []);

  // Decide the mode and build the wall once.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let cancelled = false;
    let fallbackTimer = 0;
    const still = () => {
      if (cancelled) return;
      setMode("still");
      setPlaying(true);
    };
    if (prefersReducedMotion()) {
      still();
      return;
    }
    let w: CandleWall;
    try {
      w = new CandleWall(c);
    } catch {
      still();
      return;
    }
    // If the portrait has not decoded in time, show the page without the wall's intro.
    fallbackTimer = window.setTimeout(() => {
      if (!wall.current) {
        w.destroy();
        still();
      }
    }, 4000);

    Promise.all([loadImage(MATTE), loadImage(TONE)])
      .then(([matte, tone]) => {
        if (cancelled) return;
        window.clearTimeout(fallbackTimer);
        w.setPortrait(matte, tone);
        const l = measure();
        if (l) w.setLayout(l);
        wall.current = w;
        setMode("webgl");
        setWallReady(true);
      })
      .catch(() => {
        w.destroy();
        still();
      });

    let v: HTMLVideoElement | null = null;
    if (video && !prefersStillMedia()) {
      v = document.createElement("video");
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "auto";
      v.crossOrigin = "anonymous";
      v.src = video;
      v.addEventListener("error", () => w.setVideo(null), { once: true });
      w.setVideo(v);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      w.destroy();
      wall.current = null;
      if (v) {
        v.removeAttribute("src");
        v.load();
      }
    };
  }, [measure, video]);

  // Start the intro once the wall is ready and any page transition has finished.
  useEffect(() => {
    if (!wallReady || phase !== "idle" || playing) return;
    const id = requestAnimationFrame(() => {
      wall.current?.startIntro();
      setPlaying(true);
    });
    return () => cancelAnimationFrame(id);
  }, [wallReady, phase, playing]);

  useEffect(() => {
    if (!playing || mode !== "webgl") return;
    const html = document.documentElement;
    html.classList.add("intro-run");
    return () => html.classList.remove("intro-run");
  }, [playing, mode]);

  // Resize: re-measure (no layout shift: the canvas is fixed and decorative).
  useEffect(() => {
    const onResize = () => {
      const l = measure();
      if (l && wall.current) wall.current.setLayout(l);
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    if (root.current) ro.observe(root.current);
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [measure, mode]);

  // Pointer: crosshair, lens, velocity; touch drag is the lens; idle phone lens drifts by itself.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let idle = 0;
    const armIdle = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        if (window.innerWidth < PHONE_MAX) wall.current?.setAutoLens(true);
      }, 4000);
    };
    armIdle();

    const moveDomLens = (x: number, y: number, show: boolean) => {
      const L = lens.current;
      const I = lensImg.current;
      if (!L || !I) return;
      const r = 140;
      const img = imageRect.current;
      L.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
      I.style.transform = `translate3d(${img.x - x + r}px, ${img.y - y + r}px, 0)`;
      I.style.width = `${img.w}px`;
      I.style.height = `${img.h}px`;
      L.style.opacity = show ? "1" : "0";
    };

    const onMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      wall.current?.pointerMove(x, y);
      if (crossH.current) crossH.current.style.transform = `translate3d(0, ${y}px, 0)`;
      if (crossV.current) crossV.current.style.transform = `translate3d(${x}px, 0, 0)`;
      el.dataset.pointer = "";
      const img = imageRect.current;
      const over = x > img.x && x < img.x + img.w && y > img.y && y < img.y + img.h;
      moveDomLens(x, y, over);
      armIdle();
    };
    const onLeave = () => {
      wall.current?.pointerLeave();
      delete el.dataset.pointer;
      moveDomLens(-999, -999, false);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) return;
      wall.current?.replay(e.clientX, e.clientY);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onLeave);
    el.addEventListener("click", onClick);
    return () => {
      window.clearTimeout(idle);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onLeave);
      el.removeEventListener("click", onClick);
    };
  }, []);

  const lean = (e: React.SyntheticEvent<HTMLElement>, on: boolean) => {
    const r = e.currentTarget.getBoundingClientRect();
    wall.current?.setLean(r.left + r.width / 2, r.top + r.height / 2, on);
  };

  const replayFromButton = () => {
    const img = imageRect.current;
    wall.current?.replay(img.x + img.w / 2, img.y + img.h * 0.3);
  };

  const [first, ...rest] = site.identity.name.split(" ");
  const notes = site.ui.home.figureNotes;

  return (
    <section
      ref={root}
      className="home"
      data-mode={mode}
      data-state={playing ? "playing" : "pending"}
      aria-labelledby="home-name"
    >
      <div className="home__stage" aria-hidden="true">
        <canvas ref={canvas} className="home__canvas" />
        <div className="home__hairline" />
        <div className="home__cross home__cross--h" ref={crossH} />
        <div className="home__cross home__cross--v" ref={crossV} />
      </div>

      <div className="home__frame" ref={frame}>
        <Image
          className="home__still"
          src={STILL_SRC}
          alt={site.identity.portraitAlt}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
        />
      </div>
      <div className="home__lens" ref={lens} aria-hidden="true">
        <div className="home__lens-img" ref={lensImg} style={{ backgroundImage: `url(${MATTE})` }} />
      </div>

      <div className="home__copy">
        <h1 id="home-name" className="display-xl home__name">
          <span className="home__line">
            <span>{first}</span>
          </span>{" "}
          <span className="home__line">
            <span>{rest.join(" ")}</span>
          </span>
        </h1>
        <p className="home__descriptor">{site.hero.descriptor.text}</p>
      </div>

      <nav className="home__foot" ref={foot} aria-label={site.ui.home.destinationsLabel}>
        <ul className="dest-row">
          {DESTINATIONS.map((d, i) => {
            const s = d.id === "contact" ? null : statFor(d.stat);
            return (
              <li key={d.id} className="dest-row__item" style={{ ["--n" as string]: i }}>
                <TransitionLink
                  href={d.href}
                  className="dest"
                  onPointerEnter={(e) => lean(e, true)}
                  onPointerLeave={(e) => lean(e, false)}
                  onFocus={(e) => lean(e, true)}
                  onBlur={(e) => lean(e, false)}
                >
                  <span className="dest__rule" aria-hidden="true" />
                  <span className="dest__name">{site.ui.pages[d.id]}</span>
                  {s ? (
                    <span className="dest__figure">
                      <Roll value={s.value} />
                      <span className="dest__note">{notes[s.id]}</span>
                    </span>
                  ) : null}
                </TransitionLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {mode === "webgl" ? (
        <button type="button" className="home__replay" onClick={replayFromButton}>
          {site.ui.home.replay}
        </button>
      ) : null}
    </section>
  );
}
