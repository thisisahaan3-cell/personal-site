"use client";

import { useEffect, useRef } from "react";
import type { Engine } from "./engine";

/**
 * The loading state for a set piece (not a spinner): a 1px rule in Accent A that fills as the
 * models and lighting arrive, with what is loading and how far it has got, set in the figure
 * face. It fades out when the scene is ready. Progress is written straight to the DOM.
 */
export function Loading({ engine, label, files, done }: { engine: Engine | null; label: string; files: string; done: boolean }) {
  const rule = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!engine) return;
    const off = engine.onProgress((f) => {
      if (rule.current) rule.current.style.transform = `scaleX(${f.toFixed(3)})`;
      if (pct.current) pct.current.textContent = `${Math.round(f * 100)}%`;
    });
    return () => {
      off();
    };
  }, [engine]);
  return (
    <div className="load3d" data-done={done ? "" : undefined} role="status" aria-live="polite">
      <span className="load3d__track" aria-hidden="true">
        <span className="load3d__rule" ref={rule} />
      </span>
      <span className="load3d__label">{done ? "" : label}</span>
      <span className="load3d__files" aria-hidden="true">
        {files}
      </span>
      <span className="load3d__pct" ref={pct} aria-hidden="true">
        0%
      </span>
    </div>
  );
}
