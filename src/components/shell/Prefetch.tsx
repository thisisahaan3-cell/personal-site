"use client";

import { useEffect } from "react";
import { HDRI, MODELS } from "@/lib/three/assets";

/**
 * Gets every page's 3D set piece ready in the background, starting the moment the site opens,
 * so opening a page does not wait for downloads (and, on computers, not for unpacking either).
 * Nothing about the scenes themselves changes.
 *
 *  1. All devices: loads the 3D code (three.js and each page's scene module).
 *  2. Computers (fine pointer, wide screen, 8 GB+ memory where reported): downloads AND unpacks
 *     every model and HDRI into the engine's shared cache (warmAssets in three/engine.ts).
 *  3. Phones and tablets: downloads the files into the browser cache only; unpacking every model
 *     ahead of time would hold a few hundred MB of images in memory, too much for a phone.
 *
 * Skipped on data-saver and slow (2G/3G) connections. The current page's own files still go
 * first: its scene requests them at once, and the warm-up shares the same requests.
 */
export function Prefetch() {
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
    if (nav.connection?.saveData || /(^|-)(2g|3g)$/.test(nav.connection?.effectiveType ?? "")) return;

    const urls = [...new Set<string>([HDRI.hall, ...Object.values(MODELS), ...Object.values(HDRI)])];
    const computer =
      window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1024 && (nav.deviceMemory ?? 8) >= 8;
    let cancelled = false;

    const run = async () => {
      const [engine] = await Promise.all([
        import("@/components/three/engine"),
        import("@/components/finance/bronzeScene"),
        import("@/components/finance/deskScene"),
        import("@/components/mun/lawScene"),
        import("@/components/academics/deskScene"),
        import("@/components/leadership/dossierScene"),
        import("@/components/interests/turntableScene"),
        import("@/components/contact/deskScene"),
      ]);
      if (cancelled) return;
      if (computer) {
        await engine.warmAssets(urls, () => cancelled);
        return;
      }
      for (const url of urls) {
        if (cancelled) return;
        try {
          await fetch(url, { priority: "low" } as RequestInit);
        } catch {
          /* a failed warm-up costs nothing: the scene fetches the file itself */
        }
      }
    };
    run().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
