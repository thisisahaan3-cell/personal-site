"use client";

import { AnimatePresence, motion as m } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "./motion/MotionProvider";

const ui = site.ui;
const [first, last] = site.identity.name.split(" ");

export function Header() {
  const { ready, motion, scrollToId, stopScroll } = useMotion();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [night, setNight] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const contentsBtn = useRef<HTMLButtonElement>(null);
  const openRef = useRef(false);

  // Wordmark and ground once the hero name has left the viewport.
  useEffect(() => {
    const name = document.querySelector(".hero h1");
    if (!name) return;
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { threshold: 0 });
    io.observe(name);
    return () => io.disconnect();
  }, []);

  // Hide on the way down, show on any upward scroll of 8px or more (§2.2).
  useEffect(() => {
    let last = window.scrollY;
    let upFrom = last;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (openRef.current) return;
        const y = window.scrollY;
        if (y <= 120) {
          setHidden(false);
          upFrom = y;
        } else if (y > last) {
          setHidden(true);
          upFrom = y;
        } else if (upFrom - y >= 8) {
          setHidden(false);
        }
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Current chapter and night theme, measured by ScrollTrigger so the timeline pin is accounted for.
  useEffect(() => {
    if (!ready) return;
    const triggers: ScrollTrigger[] = [];
    document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((el) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 40%",
          end: "bottom 40%",
          onToggle: (s) => {
            if (s.isActive) setCurrent(el.id);
            else if (el.id === "about" && s.direction < 0) setCurrent(null);
          },
        }),
      );
    });
    const nightEl = document.querySelector<HTMLElement>(".night");
    const law = document.getElementById("law");
    if (nightEl && law) {
      triggers.push(
        ScrollTrigger.create({
          trigger: nightEl,
          start: "top 32px",
          endTrigger: law,
          end: "top 32px",
          onToggle: (s) => setNight(s.isActive),
        }),
      );
    }
    return () => triggers.forEach((t) => t.kill());
  }, [ready]);

  const close = useCallback(
    (returnFocus = true) => {
      openRef.current = false;
      setOpen(false);
      stopScroll(false);
      if (returnFocus) requestAnimationFrame(() => contentsBtn.current?.focus());
    },
    [stopScroll],
  );

  const openOverlay = () => {
    openRef.current = true;
    setOpen(true);
    setHidden(false);
    stopScroll(true);
  };

  const go = (id: string) => {
    close(false);
    requestAnimationFrame(() => {
      scrollToId(id);
      const heading = document.getElementById(`${id}-title`) ?? document.getElementById(id);
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    });
  };

  const currentTitle = current ? ui.chapters.find((c) => c.id === current) : null;

  return (
    <>
      <header
        className={`bar ${solid ? "is-solid" : ""} ${hidden && !open ? "is-hidden" : ""} ${night && solid ? "is-night" : ""}`}
        onFocusCapture={() => setHidden(false)}
      >
        <div className="bar-ground" aria-hidden="true" />
        <nav className="bar-inner" aria-label={ui.nav.chaptersLabel}>
          <a
            href="#top"
            className="wordmark"
            tabIndex={solid ? 0 : -1}
            aria-hidden={!solid}
            onClick={(e) => {
              e.preventDefault();
              scrollToId("top");
            }}
          >
            {first}&nbsp;<span className="italic">{last}</span>
          </a>
          <div className="bar-items" data-enter="">
            <span className="bar-current" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                {solid && currentTitle && (
                  <m.span
                    key={currentTitle.id}
                    className="block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {currentTitle.title}
                  </m.span>
                )}
              </AnimatePresence>
            </span>
            <button
              ref={contentsBtn}
              type="button"
              className="tbtn"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="contents"
              onClick={openOverlay}
            >
              <span className="u">{ui.nav.contents}</span>
            </button>
            <a className="tbtn bar-resume" href={site.contact.resumeFile} download>
              <span className="u">{ui.nav.resume}</span>
            </a>
          </div>
        </nav>
      </header>
      <AnimatePresence>
        {open && <Contents current={current} onClose={() => close()} onGo={go} motion={motion} />}
      </AnimatePresence>
    </>
  );
}

function Contents({
  current,
  onClose,
  onGo,
  motion,
}: {
  current: string | null;
  onClose: () => void;
  onGo: (id: string) => void;
  motion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        const list = focusables();
        const firstEl = list[0];
        const lastEl = list[list.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <m.div
      ref={ref}
      id="contents"
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={ui.nav.contents}
      data-lenis-prevent=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: motion ? 0.3 : 0.15 } }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <m.span
        className="overlay-meridian"
        aria-hidden="true"
        initial={motion ? { scaleY: 0 } : false}
        animate={{ scaleY: 1, transition: { duration: 0.4, ease: [0.65, 0, 0.35, 1] } }}
      />
      <div className="overlay-bar">
        <button type="button" className="tbtn" onClick={onClose}>
          <span className="u">{ui.nav.close}</span>
        </button>
      </div>
      <div className="overlay-body">
        <ol className="overlay-list">
          {ui.chapters.map((c, i) => (
            <m.li
              key={c.id}
              initial={motion ? { opacity: 0, y: 12 } : false}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, delay: 0.03 * i, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              {current === c.id && <span className="mark-dot cur-dot" aria-hidden="true" />}
              <a
                href={`#${c.id}`}
                aria-current={current === c.id ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onGo(c.id);
                }}
              >
                <span className={c.style === "italic" ? "italic" : ""}>{c.title}</span>
                {c.note && <span className="t-data fg2">{c.note}</span>}
              </a>
            </m.li>
          ))}
        </ol>
        <div className="overlay-foot">
          <a className="ilink t-body" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
          <a className="btn btn-primary" href={site.contact.resumeFile} download>
            {ui.nav.downloadResume}
          </a>
        </div>
      </div>
    </m.div>
  );
}
