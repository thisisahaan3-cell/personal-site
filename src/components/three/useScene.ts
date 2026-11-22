"use client";

import { useEffect, useRef, useState } from "react";
import type { Engine } from "./engine";
import { useStage } from "./Stage3D";
import { beginBuild, beginPrepare } from "@/lib/three/busy";

/**
 * Build a set piece's scene once the page's engine exists, and dispose it on unmount.
 * `build` usually dynamically imports the scene module (so three.js stays out of the page's
 * first download) and returns its API. If anything fails (no WebGL, a model will not load),
 * `failed` turns true and the set piece shows its flat version instead.
 */
export function useScene<T extends { dispose: () => void }>(enabled: boolean, build: (engine: Engine) => Promise<T>) {
  const stage = useStage();
  const buildRef = useRef(build);
  useEffect(() => {
    buildRef.current = build;
  });
  const [engine, setEngine] = useState<Engine | null>(null);
  const [api, setApi] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let built: T | null = null;
    const end = beginBuild();
    const ready = beginPrepare();
    stage
      .engine()
      .then(async (e) => {
        if (cancelled) return;
        setEngine(e);
        built = await buildRef.current(e);
        if (!cancelled) await e.prepare();
        if (cancelled) {
          built.dispose();
          built = null;
          return;
        }
        setApi(built);
        requestAnimationFrame(() => requestAnimationFrame(ready));
        // Give the first frames a moment before the background warm-up resumes.
        window.setTimeout(end, 1500);
      })
      .catch((err) => {
        console.warn("3D set piece unavailable, showing the flat version.", err);
        if (!cancelled) setFailed(true);
        end();
        ready();
      });
    return () => {
      cancelled = true;
      end();
      ready();
      built?.dispose();
      setApi(null);
    };
  }, [enabled, stage]);

  return { engine, api, failed };
}
