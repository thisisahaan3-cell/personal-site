import { existsSync } from "node:fs";
import path from "node:path";
import { site } from "@/content/site";
import type { MediaKey } from "@/lib/pages";

export type ResolvedMedia = { video: string | null; poster: string | null };

/**
 * Runs at build time (static export). Returns only the files that exist in `public/`,
 * so a missing clip renders the graded ground fallback instead of a broken request.
 */
export function resolveMedia(key: MediaKey | null): ResolvedMedia {
  if (!key) return { video: null, poster: null };
  const m = site.media[key];
  const has = (p: string | undefined): p is string =>
    Boolean(p) && existsSync(path.join(process.cwd(), "public", String(p).replace(/^\//, "")));
  if (m.kind === "still") return { video: null, poster: has(m.src) ? m.src : null };
  return { video: has(m.src) ? m.src : null, poster: has(m.poster) ? m.poster : null };
}
