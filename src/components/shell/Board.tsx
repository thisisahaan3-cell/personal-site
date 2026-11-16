"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { DESTINATIONS, pageForPath, statFor } from "@/lib/pages";
import { TransitionLink } from "./Transition";

const ui = site.ui;

/**
 * The board (direction §3). Desktop: a fixed top strip, name at left, five destinations at
 * right with an amber tick under the current one, "Download resume" last. Phone: a fixed
 * bottom bar (name, Menu) that opens a full-screen board of five rows with real figures.
 * On Home the destinations live in the intro's own foot row, so the strip shows only the resume.
 */
export function Board() {
  const pathname = usePathname();
  const current = pageForPath(pathname);
  const isHome = current.id === "home";
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) menuButton.current?.focus();
  }, []);

  // Close the sheet whenever the page changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const el = sheet.current;
    el?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>("a, button"));
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.dataset.sheet = "open";
    return () => {
      document.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.sheet;
    };
  }, [open, close]);

  return (
    <>
      <header className="board" data-home={isHome ? "" : undefined}>
        <nav className="board__strip" aria-label={ui.board.label}>
          <TransitionLink
            href="/"
            className="board__name"
            aria-label={ui.board.homeLink}
            aria-current={isHome ? "page" : undefined}
          >
            {site.identity.name}
          </TransitionLink>
          <ul className="board__list">
            {DESTINATIONS.map((d) => (
              <li key={d.id}>
                <TransitionLink
                  href={d.href}
                  className="board__link"
                  aria-current={current.id === d.id ? "page" : undefined}
                >
                  {ui.pages[d.id]}
                </TransitionLink>
              </li>
            ))}
            <li className="board__resume-item">
              <a className="board__link board__resume" href={site.identity.resumeFile} download>
                {ui.board.resume}
                <span className="board__note">{ui.board.resumeNote}</span>
              </a>
            </li>
          </ul>
          <button
            ref={menuButton}
            type="button"
            className="board__menu"
            aria-expanded={open}
            aria-controls="board-sheet"
            onClick={() => setOpen(true)}
          >
            {ui.board.menu}
          </button>
        </nav>
      </header>

      <div
        id="board-sheet"
        ref={sheet}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={ui.board.label}
        data-open={open ? "" : undefined}
        hidden={!open}
      >
        <ul className="sheet__rows">
          {DESTINATIONS.map((d) => {
            const s = statFor(d.id === "contact" ? null : d.stat);
            return (
              <li key={d.id}>
                <TransitionLink
                  href={d.href}
                  className="sheet__row"
                  aria-current={current.id === d.id ? "page" : undefined}
                >
                  <span className="sheet__name">{ui.pages[d.id]}</span>
                  {s ? <span className="sheet__figure">{s.value}</span> : null}
                </TransitionLink>
              </li>
            );
          })}
        </ul>
        <div className="sheet__foot">
          <a className="sheet__resume" href={site.identity.resumeFile} download>
            {ui.board.resume}
            <span className="board__note">{ui.board.resumeNote}</span>
          </a>
          <button type="button" className="sheet__close" onClick={() => close()}>
            {ui.board.close}
          </button>
        </div>
      </div>
    </>
  );
}
