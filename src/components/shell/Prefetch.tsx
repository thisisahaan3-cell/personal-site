"use client";

import { useEffect } from "react";
import { HDRI, MODELS } from "@/lib/three/assets";

/**
 * Gets every page's 3D set piece ready in the background, starting the moment the site opens,
 * so opening a page does not wait for downloads (and, on most devices, not for unpacking either).
 * Nothing about the scenes themselves changes.
 *
 *  1. All devices: loads the 3D code (three.js and each page's scene module).
 *  2. Devices with 4 GB+ memory (or that do not report it): downloads AND unpacks every model and
 *     HDRI into the engine's shared cache (warmAssets in three/engine.ts). This holds a few hundred
 *     MB of images in memory; the client accepted that trade for speed.
 *  3. Devices reporting under 4 GB: downloads the files into the browser cache only.
 *
 * Skipped on data-saver and slow (2G/3G) connections. The current page's own files still go
 * first: its scene requests them at once, and the warm-up shares the same requests.
 */
export function Prefetch() {
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
    if (nav.connection?.saveData || /(^|-)(2g|3g)$/.test(nav.connection?.effectiveType ?? "")) return;

    const urls = [...new Set<string>([HDRI.hall, ...Object.values(MODELS), ...Object.values(HDRI)])];
    // The client asked for maximum speed even if it works the device harder, so every device with
    // 4 GB+ (or that does not report memory, like iPhones) unpacks everything ahead of time.
    const unpack = (nav.deviceMemory ?? 8) >= 4;
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
      if (unpack) {
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
