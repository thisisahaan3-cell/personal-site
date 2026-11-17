"use client";

import { ArrowUpRight, Copy, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { useSetPieceMode } from "@/lib/three/quality";
import { Loading } from "@/components/three/Loading";
import { pointerNdcOf } from "@/components/three/pointer";
import { useScene } from "@/components/three/useScene";
import type { DeskId } from "./deskScene";

const ui = site.ui.contact;
const LINKS = site.contact.links;
const PHONE_MAX = 760;

function fontOf(name: string, fallback: string) {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
}

/**
 * Contact: the desk at night (desktop, full motion) beside the links as real, large DOM links.
 * Phones, reduced motion and no WebGL get the same links without the desk.
 */
export function Contact() {
  const mode = useSetPieceMode();
  const [phone, setPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${PHONE_MAX - 1}px)`);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const live = mode === "motion" && phone === false;
  return live ? <Desk /> : <Links live={false} />;
}

type LinksProps = {
  live: boolean;
  onHover?: (id: DeskId | null) => void;
  refs?: React.RefObject<Record<string, HTMLAnchorElement | null>>;
};

function Links({ live, onHover, refs }: LinksProps) {
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const email = LINKS.find((l) => l.id === "email");
  const rest = LINKS.filter((l) => l.id !== "email");
  const hover = (id: string | null) => onHover?.(id as DeskId | null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.email);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    window.setTimeout(() => setCopied(""), 2400);
  };
  const ref = (id: string) => (el: HTMLAnchorElement | null) => {
    if (refs?.current) refs.current[id] = el;
  };

  return (
    <div className="contact__copy" data-live={live ? "" : undefined}>
      <h1 id="page-title" className="contact__title">
        {site.ui.pages.contact}
      </h1>
      {email ? (
        <div className="contact__mail">
          <a
            ref={ref("email")}
            className="contact__email"
            data-id="email"
            href={email.url}
            onMouseEnter={() => hover("email")}
            onMouseLeave={() => hover(null)}
            onFocus={() => hover("email")}
            onBlur={() => hover(null)}
          >
            {email.display}
          </a>
          <button type="button" className="contact__copy-btn" onClick={copy}>
            {copied === "ok" ? <Check aria-hidden="true" size={18} strokeWidth={1.5} /> : <Copy aria-hidden="true" size={18} strokeWidth={1.5} />}
            <span>{copied === "ok" ? ui.copied : ui.copyEmail}</span>
          </button>
          <span className="sr-only" aria-live="polite">
            {copied === "ok" ? ui.copied : copied === "fail" ? ui.copyFailed : ""}
          </span>
        </div>
      ) : null}
      <ul className="contact__links" aria-label={ui.linksLabel}>
        {rest.map((l) => {
          const toCome = l.placeholder || !l.url;
          const external = /^https?:/.test(l.url);
          return (
            <li key={l.id}>
              {toCome ? (
                <span className="contact__link" data-id={l.id} aria-disabled="true">
                  <span className="contact__label">{l.label}</span>
                  <span className="contact__display">{ui.linkToCome}</span>
                </span>
              ) : (
                <a
                  ref={ref(l.id)}
                  className="contact__link"
                  data-id={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => hover(l.id)}
                  onMouseLeave={() => hover(null)}
                  onFocus={() => hover(l.id)}
                  onBlur={() => hover(null)}
                >
                  <span className="contact__label">{l.label}</span>
                  <span className="contact__display">{l.display}</span>
                  {external ? <ArrowUpRight className="contact__out" aria-hidden="true" size={22} strokeWidth={1.5} /> : null}
                  <span className="sr-only">({ui.newTab})</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <p className="contact__refs">{site.contact.referencesLine}</p>
      {live ? <p className="contact__hint">{ui.deskHint}</p> : null}
    </div>
  );
}

function Desk() {
  const stage = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const anchors = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [hovered, setHovered] = useState<DeskId | null>(null);

  const { engine, api, failed } = useScene(true, async (e) => {
    const { buildDesk } = await import("./deskScene");
    return buildDesk(e, {
      element: stage.current!,
      label: label.current!,
      email: site.contact.email,
      portrait: site.identity.portrait,
      motion: true,
      fonts: { display: fontOf("--ff-display", "serif"), text: fontOf("--ff-text", "sans-serif") },
    });
  });

  const hover = (id: DeskId | null) => {
    setHovered(id);
    api?.hover(id);
  };

  if (failed)
    return (
      <section className="desk3d" aria-labelledby="page-title">
        <Links live={false} />
      </section>
    );

  const name = hovered ? LINKS.find((l) => l.id === hovered)?.label : "";

  return (
    <section className="desk3d" data-ready={api ? "" : undefined} aria-labelledby="page-title">
      <div
        ref={stage}
        className="desk3d__stage"
        data-hover={hovered ? "" : undefined}
        onPointerMove={(ev) => {
          if (!stage.current || !api || ev.pointerType !== "mouse") return;
          if ((ev.target as HTMLElement).closest(".contact__copy")) return;
          const p = pointerNdcOf(ev, stage.current);
          api.pointer(p.x, p.y);
          const id = api.pick(p.x, p.y);
          if (id !== hovered) hover(id);
        }}
        onPointerLeave={() => {
          api?.pointer(0, 0);
          hover(null);
        }}
        onClick={(ev) => {
          if (!stage.current || !api) return;
          if ((ev.target as HTMLElement).closest("a, button")) return;
          const p = pointerNdcOf(ev, stage.current);
          const id = api.pick(p.x, p.y);
          if (id) anchors.current[id]?.click();
        }}
      >
        <span ref={label} className="desk3d__label" aria-hidden="true">
          {name}
        </span>
        <Loading engine={engine} label={ui.deskLoading} files="interior-warm.hdr" done={Boolean(api)} />
      </div>
      <Links live onHover={hover} refs={anchors} />
    </section>
  );
}
