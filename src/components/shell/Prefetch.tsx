"use client";

import { useEffect } from "react";
import { HDRI, MODELS } from "@/lib/three/assets";

/**
 * Warms the browser cache with every page's 3D models and lighting, one file at a time at low
 * priority, once the current page has loaded and gone quiet. Opening another page then starts
 * its scene from cache instead of the network. Nothing about the scenes themselves changes.
 * Skipped on data-saver and slow (2G/3G) connections.
 */
export function Prefetch() {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? "")) return;

    const urls = [...new Set<string>([HDRI.hall, ...Object.values(MODELS), ...Object.values(HDRI)])];
    let cancelled = false;
    let timer = 0;

    const run = async () => {
      for (const url of urls) {
        if (cancelled) return;
        try {
          await fetch(url, { priority: "low" } as RequestInit);
        } catch {
          /* a failed warm-up costs nothing: the scene fetches the file itself */
        }
      }
    };
    const start = () => {
      timer = window.setTimeout(() => {
        const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
        if (idle) idle(() => void run());
        else void run();
      }, 3000);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", start);
    };
  }, []);
  return null;
}
