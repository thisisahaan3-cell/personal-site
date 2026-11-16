import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { site, type Editable } from "@/content/site";
import { chapter, logoFor, SERIF_MISSING } from "@/lib/content";

/* ── The line ── */

export function Spine({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`spine ${className}`} data-spine="" />;
}

/** A full-width block that carries the line down the meridian beside its content. */
export function Run({
  children,
  className = "",
  spine = true,
  style,
}: {
  children?: ReactNode;
  className?: string;
  spine?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className={`run ${className}`} style={style}>
      {spine && <Spine />}
      {children}
    </div>
  );
}

/** Grid column placement. Desktop columns are numbered as the 12-column page grid (3 to 12 = content). */
export function Col({
  d,
  t,
  children,
  className = "",
  as: Tag = "div",
  style,
}: {
  d: [number, number];
  t?: [number, number];
  children?: ReactNode;
  className?: string;
  as?: "div" | "section" | "aside";
  style?: CSSProperties;
}) {
  const s = {
    "--cs": d[0] - 2,
    "--ce": d[1] - 1,
    ...(t ? { "--ts": t[0], "--te": t[1] + 1 } : {}),
    ...style,
  } as CSSProperties;
  return (
    <Tag className={`col ${className}`} style={s}>
      {children}
    </Tag>
  );
}

/* ── Chapters ── */

export function Chapter({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`chapter ${className}`} data-chapter={id}>
      {children}
    </section>
  );
}

export function ChapterTitle({ id, className = "" }: { id: string; className?: string }) {
  const ch = chapter(id);
  return (
    <h2
      id={`${id}-title`}
      className={`t-title chapter-title ${ch.style === "italic" ? "italic" : ""} ${className}`}
      data-title=""
    >
      {ch.title}
    </h2>
  );
}

export function ChapterNote({ id }: { id: string }) {
  const ch = chapter(id);
  if (!ch.note) return null;
  return <p className="chapter-note t-data">{ch.note}</p>;
}

export function ChapterHead({ id }: { id: string }) {
  return (
    <Run className="chapter-head">
      <ChapterNote id={id} />
      <ChapterTitle id={id} />
    </Run>
  );
}

/* ── Placeholder (§2.6) ── */

export function Placeholder({ slot, compact = false }: { slot: string; compact?: boolean }) {
  return (
    <div className="ph" data-placeholder="">
      <p className="ph-head t-data">
        <span>{slot}</span>
        <span>{site.ui.placeholder.label}</span>
      </p>
      <div className="ph-rules" aria-hidden="true">
        <span />
        <span />
        {!compact && <span />}
      </div>
    </div>
  );
}

/** Shows the text once it is no longer a placeholder; until then, the ruled block. */
export function EditableText({
  value,
  slot,
  compact,
  className = "t-body measure",
}: {
  value: Editable | Editable[];
  slot: string;
  compact?: boolean;
  className?: string;
}) {
  const items = Array.isArray(value) ? value : [value];
  if (items.some((v) => v.placeholder)) return <Placeholder slot={slot} compact={compact} />;
  return (
    <div className={className}>
      {items.map((v, i) => (
        <p key={i} className={i ? "mt-4" : ""}>
          {v.text}
        </p>
      ))}
    </div>
  );
}

/* ── Logo tile (§2.8) ── */

export function LogoTile({ org }: { org?: string | null }) {
  const logo = logoFor(org);
  if (!logo) return null;
  return (
    <span className={`logo-tile ${logo.onDark ? "on-dark" : ""}`}>
      <Image src={logo.src} alt="" width={logo.width} height={logo.height} loading="lazy" />
    </span>
  );
}

/* ── Serif text with glyphs Instrument Serif lacks set in Geist (§1.2) ── */

export function SerifSafe({ text }: { text: string }) {
  const parts = text.split(SERIF_MISSING);
  return (
    <>
      {parts.map((p, i) =>
        SERIF_MISSING.test(p) ? (
          <span key={i} className="glyph-fallback">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}

/* ── Figure scaffolding (§2.1) ── */

/** One drawing variant of a figure. viewBox x = 0 is the meridian; the box is reserved by aspect-ratio. */
export function FigureBox({
  w,
  h,
  variant,
  children,
  className = "",
  style,
}: {
  w: number;
  h: number;
  variant: "desk" | "phone" | "both";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const cls = variant === "both" ? "" : variant === "desk" ? "fig-desk" : "fig-phone";
  return (
    <div
      className={`figure ${cls} ${className}`}
      style={{ "--ar": `${w} / ${h}`, ...style } as CSSProperties}
      data-figure=""
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

/** A reveal window over part of the line. axis: x = left to right, -x = right to left, y = top to bottom. */
export function Wipe({
  axis,
  from = 0,
  to = 1,
  children,
}: {
  axis: "x" | "-x" | "y" | "-y";
  from?: number;
  to?: number;
  children: ReactNode;
}) {
  return (
    <div className="wipe" data-wipe={axis} data-from={from} data-to={to}>
      <div className="wipe-inner">{children}</div>
    </div>
  );
}

/** An SVG layer sized to the figure box. */
export function Svg({
  w,
  h,
  children,
  className = "fig-layer",
  fade = false,
}: {
  w: number;
  h: number;
  children: ReactNode;
  className?: string;
  fade?: boolean;
}) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMinYMin meet"
      className={className}
      data-fade={fade ? "" : undefined}
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** An HTML label positioned in percentages of the figure box. */
export function FLabel({
  x,
  y,
  w,
  h,
  at,
  align = "left",
  valign = "top",
  className = "",
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  at?: number;
  align?: "left" | "right" | "center";
  valign?: "top" | "bottom" | "middle" | "baseline";
  className?: string;
  children: ReactNode;
}) {
  const tx = align === "left" ? "0" : align === "right" ? "-100%" : "-50%";
  const ty = valign === "top" ? "0" : valign === "bottom" ? "-100%" : valign === "middle" ? "-50%" : "-80%";
  return (
    <span
      className={`flabel ${className}`}
      style={{ left: `${(x / w) * 100}%`, top: `${(y / h) * 100}%`, translate: `${tx} ${ty}` }}
      data-at={at}
    >
      {children}
    </span>
  );
}
