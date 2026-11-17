"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { detectQuality } from "@/lib/three/quality";
import type { Engine } from "./engine";

/**
 * Wrap a page that has 3D set pieces in <Stage3D>. It owns the page's single WebGL canvas
 * (fixed, full viewport, behind the page's DOM text, never catching the pointer) and creates
 * the engine on first request, after first paint, with a dynamic import, so three.js is only
 * downloaded on pages that use it. Everything is disposed when the page unmounts.
 *
 *   const stage = useStage();
 *   const engine = await stage.engine();   // then engine.addView({ element, scene, camera, ... })
 */
type StageApi = { engine: () => Promise<Engine> };

const StageContext = createContext<StageApi | null>(null);

export function useStage() {
  const s = useContext(StageContext);
  if (!s) throw new Error("useStage() needs a <Stage3D> around the page");
  return s;
}

/** Resolves after the page has painted and the browser is idle (or 1.2s at most). */
function afterFirstPaint() {
  return new Promise<void>((resolve) => {
    const go = () => {
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback;
      if (ric) ric(() => resolve(), { timeout: 1200 });
      else setTimeout(resolve, 60);
    };
    if (document.readyState === "complete") requestAnimationFrame(() => requestAnimationFrame(go));
    else window.addEventListener("load", go, { once: true });
  });
}

export function Stage3D({ children }: { children: React.ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef<{ engine: Engine; canvas: HTMLCanvasElement } | null>(null);
  const pending = useRef<Promise<Engine> | null>(null);

  const api = useMemo<StageApi>(
    () => ({
      engine: () => {
        if (!pending.current) {
          pending.current = afterFirstPaint()
            .then(() => import("./engine"))
            .then(({ Engine }) => {
              const h = host.current;
              if (!h) throw new Error("Stage3D is not mounted");
              // A fresh canvas per engine, so a disposed (context-lost) canvas is never reused.
              const canvas = document.createElement("canvas");
              canvas.className = "stage3d__canvas";
              h.appendChild(canvas);
              const engine = new Engine(canvas, detectQuality());
              live.current = { engine, canvas };
              return engine;
            });
          pending.current.catch(() => {
            pending.current = null;
          });
        }
        return pending.current;
      },
    }),
    [],
  );

  useEffect(
    () => () => {
      const l = live.current;
      live.current = null;
      pending.current = null;
      if (l) {
        l.engine.dispose();
        l.canvas.remove();
      }
    },
    [],
  );

  return (
    <StageContext.Provider value={api}>
      <div ref={host} className="stage3d" aria-hidden="true" />
      {children}
    </StageContext.Provider>
  );
}
