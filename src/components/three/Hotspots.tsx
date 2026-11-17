"use client";

import { forwardRef } from "react";

/**
 * Hotspots: points anchored to objects in a 3D scene, each mirrored by a real DOM button (or
 * link) in reading order. The scene's HotspotProjector writes each hotspot's screen position
 * to the CSS variables --hx and --hy; CSS draws a small anchor ring, a 1px leader line in
 * Accent A and the label (a figure plus one line of text). Selecting one is up to the set piece
 * (open a panel, move the camera). Everything here is real, focusable text; the canvas is not.
 */
export type HotspotItem = {
  id: string;
  figure: string;
  line: string;
  /** Accessible name when the visible text is not enough. */
  label?: string;
  /** Which side the label sits on, relative to its anchor. */
  side?: "left" | "right";
  /** Leader length in px (default 72). */
  reach?: number;
  /** A real link instead of a button. */
  href?: string;
};

type Props = {
  items: HotspotItem[];
  active?: string | null;
  /** Hotspots revealed so far (by scroll phase); the rest are hidden and inert. */
  shown?: (id: string) => boolean;
  onSelect?: (id: string) => void;
  onFocusItem?: (id: string | null) => void;
  label: string;
  className?: string;
};

export const Hotspots = forwardRef<HTMLDivElement, Props & { refs: React.RefObject<(HTMLElement | null)[]> }>(
  function Hotspots({ items, active, shown, onSelect, onFocusItem, label, className, refs }, ref) {
    return (
      <div ref={ref} className={`hotspots ${className ?? ""}`} role="group" aria-label={label}>
        {items.map((h, i) => {
          const visible = shown ? shown(h.id) : true;
          const inner = (
            <>
              <span className="hotspot__figure">{h.figure}</span>
              <span className="hotspot__line">{h.line}</span>
            </>
          );
          return (
            <div
              key={h.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="hotspot"
              data-side={h.side ?? "right"}
              data-shown={visible ? "" : undefined}
              data-active={active === h.id ? "" : undefined}
              style={{ ["--reach" as string]: `${h.reach ?? 72}px` }}
            >
              <span className="hotspot__ring" aria-hidden="true" />
              <span className="hotspot__leader" aria-hidden="true" />
              {h.href ? (
                <a
                  className="hotspot__label"
                  href={h.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={visible ? undefined : -1}
                  aria-label={h.label}
                  onFocus={() => onFocusItem?.(h.id)}
                  onBlur={() => onFocusItem?.(null)}
                >
                  {inner}
                </a>
              ) : (
                <button
                  type="button"
                  className="hotspot__label"
                  aria-pressed={active === h.id}
                  aria-label={h.label}
                  tabIndex={visible ? undefined : -1}
                  onClick={() => onSelect?.(h.id)}
                  onFocus={() => onFocusItem?.(h.id)}
                  onBlur={() => onFocusItem?.(null)}
                >
                  {inner}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);
