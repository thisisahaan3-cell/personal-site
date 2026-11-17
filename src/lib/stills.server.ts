import { existsSync } from "node:fs";
import path from "node:path";

/**
 * The still frame for a set piece's flat version (no WebGL2, save-data, a failed load):
 * public/stills/<name>.webp, rendered from the same scene. Null until the file exists.
 */
export function stillFor(name: string) {
  const rel = `/stills/${name}.webp`;
  return existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}
