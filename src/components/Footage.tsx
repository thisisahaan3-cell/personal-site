"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { prefersStillMedia } from "@/lib/motion";

/**
 * A page's footage slot, graded to the ground (greyscale, tinted, ~40% brightness).
 * Plays only on screen, never under reduced motion or save-data (poster only), and falls back
 * to the plain graded ground when the file is missing or cannot play. Decorative.
 */
export function Footage({ video, poster }: { video: string | null; poster: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || prefersStillMedia()) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !document.hidden) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    const onVis = () => (document.hidden ? v.pause() : v.play().catch(() => {}));
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="footage" aria-hidden="true">
      {video && !failed ? (
        <video
          ref={ref}
          className="footage__media"
          src={video}
          poster={poster ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      ) : poster ? (
        <Image className="footage__media" src={poster} alt="" fill sizes="100vw" />
      ) : null}
      <div className="footage__grade" />
    </div>
  );
}
