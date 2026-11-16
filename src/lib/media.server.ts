import { existsSync } from "node:fs";
import path from "node:path";
import { MEDIA, type MediaKey } from "@/lib/pages";

export type ResolvedMedia = { video: string | null; poster: string | null };

/**
 * Runs at build time (static export). Returns only the files that exist in `public/`,
 * so a missing clip renders the graded ground fallback instead of a broken request.
 */
export function resolveMedia(key: MediaKey | null): ResolvedMedia {
  if (!key) return { video: null, poster: null };
  const m = MEDIA[key];
  const has = (p: string | null) =>
    p !== null && existsSync(path.join(process.cwd(), "public", p.replace(/^\//, "")));
  return { video: has(m.video) ? m.video : null, poster: has(m.poster) ? m.poster : null };
}
