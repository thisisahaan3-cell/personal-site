import Image from "next/image";
import { site } from "@/content/site";

/**
 * The page's slot for Ahaan's own photo or clip (`site.mediaSlots`). Renders nothing until `src`
 * is set; then it reserves its aspect ratio so nothing shifts while the file loads.
 */
export function OwnMedia({ slot }: { slot: keyof typeof site.mediaSlots }) {
  const m = site.mediaSlots[slot];
  if (!m.src) return null;
  return (
    <figure className="own-media" style={{ aspectRatio: m.aspect }}>
      {m.kind === "loop" ? (
        <video
          className="own-media__file"
          src={m.src}
          poster={m.poster || undefined}
          muted
          loop
          playsInline
          autoPlay
          aria-label={m.alt || undefined}
        />
      ) : (
        <Image className="own-media__file" src={m.src} alt={m.alt} fill sizes="(max-width: 760px) 100vw, 80vw" />
      )}
    </figure>
  );
}
