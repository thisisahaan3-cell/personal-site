"use client";

import { useEffect } from "react";
import { HDRI, MODELS } from "@/lib/three/assets";

/**
 * Warms the browser cache with every page's 3D models and lighting, one file at a time at low
 * priority, starting the moment the site opens (the current page's own files still go first,
 * at normal priority). Opening another page then starts
 * its scene from cache instead of the network. Nothing about the scenes themselves changes.
 * Skipped on data-saver and slow (2G/3G) connections.
 */
export function Prefetch() {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? "")) return;

    const urls = [...new Set<string>([HDRI.hall, ...Object.values(MODELS), ...Object.values(HDRI)])];
    let cancelled = false;

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
    void run();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
