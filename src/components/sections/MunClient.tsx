"use client";

import { AnimatePresence, motion as m } from "motion/react";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { site, type AwardLevel, type MunAward } from "@/content/site";
import { fill } from "@/lib/content";
import { ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "../motion/MotionProvider";
import { FigureBox, FLabel, Svg, Wipe } from "../primitives";

const ui = site.ui.mun;
const awards = site.mun.awards;
const board = site.mun.executiveBoard;

/** The order of the AwardLevel type, highest first. */
const LEVELS: AwardLevel[] = [
  "Best Delegate",
  "High Commendation",
  "Runner Up",
  "Special Mention",
  "Honourable Mention",
  "Verbal Mention",
];

const committees = Array.from(new Set([...awards.map((a) => a.committee), ...board.map((b) => b.committee)]));
const countFor = (c: string) => awards.filter((a) => a.committee === c).length;
const defaultCommittee = [...committees].sort((a, b) => countFor(b) - countFor(a))[0];

type MunCtx = {
  active: string | null;
  face: string;
  choose: (c: string) => void;
  year: number | null;
  setYear: (y: number | null) => void;
};
const Ctx = createContext<MunCtx | null>(null);
const useMun = () => useContext(Ctx)!;

export function MunProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const [face, setFace] = useState(defaultCommittee);
  const [year, setYear] = useState<number | null>(null);
  const value = useMemo(
    () => ({
      active,
      face,
      year,
      setYear,
      choose: (c: string) => {
        setFace(c);
        setActive((cur) => (cur === c ? null : c));
      },
    }),
    [active, face, year],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ── Placard and committee roll (§3.4) ── */

export function Placard() {
  const { face, active, choose } = useMun();
  const { motion } = useMotion();
  const n = countFor(face);
  const role = board.find((b) => b.committee === face)?.role;
  const len = face.length;
  return (
    <div className="placard-block">
      <div className="placard" aria-hidden="true">
        <AnimatePresence initial={false}>
          <m.span
            key={face}
            className="placard-face"
            style={{ ["--n" as string]: len }}
            initial={motion ? { y: "100%" } : { opacity: 0 }}
            animate={motion ? { y: "0%" } : { opacity: 1 }}
            exit={motion ? { y: "-100%" } : { opacity: 0 }}
            transition={{ duration: motion ? 0.3 : 0.15, ease: [0.65, 0, 0.35, 1] }}
          >
            {face}
          </m.span>
        </AnimatePresence>
        <span className="placard-fold" />
      </div>
      <p className="t-small fg2 placard-meta" aria-live="polite">
        <span className="sr-only">{face}. </span>
        {n === 1 ? ui.placard.countOne : fill(ui.placard.countMany, { n })}
        {role && (
          <>
            <br />
            {fill(ui.placard.boardRole, { role })}
          </>
        )}
      </p>
      <div className="placard-roll" role="group" aria-label={ui.placard.rollLabel}>
        {committees.map((c) => (
          <button
            key={c}
            type="button"
            className={`tbtn ${face === c ? "is-on" : ""}`}
            aria-pressed={active === c}
            onClick={() => choose(c)}
          >
            <span className="u">{c}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Tally strip ── */

const years = Array.from(new Set(awards.map((a) => a.year))).sort((a, b) => a - b);

const tallies = years.map((y, i) => ({
  y,
  n: awards.filter((a) => a.year === y).length,
  total: awards.filter((a) => a.year <= years[i]).length,
}));

export function Tally() {
  const { year, setYear } = useMun();
  return (
    <div className="tally" role="group" aria-label={ui.tally.groupLabel}>
      {tallies.map(({ y, n, total }) => {
        return (
          <button
            key={y}
            type="button"
            className={`tally-cell ${year === y ? "is-on" : ""}`}
            aria-pressed={year === y}
            onClick={() => setYear(year === y ? null : y)}
          >
            <span className="t-data">{y}</span>
            <span className="t-title2 tally-n">{n}</span>
            <span className="t-data fg2">{fill(ui.tally.runningTotal, { n: total })}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── The sortable record ── */

type SortKey = "year" | "award" | "committee";
const DEFAULT_DIR: Record<SortKey, "asc" | "desc"> = { year: "desc", award: "asc", committee: "asc" };

function sortRows(rows: (MunAward & { i: number })[], key: SortKey, dir: "asc" | "desc") {
  const s = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let d = 0;
    if (key === "year") d = (a.year - b.year) * s;
    else if (key === "award") d = (LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)) * s;
    else d = a.committee.localeCompare(b.committee) * s;
    return d || a.i - b.i;
  });
}

const groupOf = (r: MunAward, key: SortKey) =>
  key === "year" ? String(r.year) : key === "award" ? r.level : r.committee;

function SortBtn({
  k,
  label,
  cur,
  dir,
  onSort,
}: {
  k: SortKey;
  label: string;
  cur: SortKey;
  dir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}) {
  return (
    <button type="button" className={`tbtn ${cur === k ? "is-on" : ""}`} onClick={() => onSort(k)}>
      <span className="u">{label}</span>
      {cur === k && <span className="sr-only">, {dir === "asc" ? ui.sort.ascending : ui.sort.descending}</span>}
    </button>
  );
}

export function Record() {
  const { year, active } = useMun();
  const { motion } = useMotion();
  const [key, setKey] = useState<SortKey>("year");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const rows = useMemo(() => sortRows(awards.map((a, i) => ({ ...a, i })), key, dir), [key, dir]);
  const counts = useMemo(() => {
    const c = new Map<string, number>();
    rows.forEach((r) => c.set(groupOf(r, key), (c.get(groupOf(r, key)) ?? 0) + 1));
    return c;
  }, [rows, key]);

  const sortBy = (k: SortKey) => {
    if (k === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setKey(k);
      setDir(DEFAULT_DIR[k]);
    }
  };
  const ariaSort = (k: SortKey) => (k === key ? (dir === "asc" ? "ascending" : "descending") : "none");
  const sb = { cur: key, dir, onSort: sortBy };
  const heads = rows.map((r, idx) => idx === 0 || groupOf(rows[idx - 1], key) !== groupOf(r, key));

  return (
    <>
      <div className="record-sort" role="group" aria-label={ui.sort.groupLabel}>
        <span className="t-data fg2">{ui.sort.groupLabel}</span>
        <SortBtn {...sb} k="year" label={ui.sort.year} />
        <SortBtn {...sb} k="award" label={ui.sort.award} />
        <SortBtn {...sb} k="committee" label={ui.sort.committee} />
      </div>
      <table className="ruled record">
        <thead>
          <tr>
            <th scope="col">{ui.columns.conference}</th>
            <th scope="col" aria-sort={ariaSort("committee")}>
              <SortBtn {...sb} k="committee" label={ui.columns.committee} />
            </th>
            <th scope="col" aria-sort={ariaSort("award")}>
              <SortBtn {...sb} k="award" label={ui.columns.award} />
            </th>
            <th scope="col" aria-sort={ariaSort("year")} className="c-yearhead">
              <SortBtn {...sb} k="year" label={ui.columns.year} />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const g = groupOf(r, key);
            const head = heads[idx];
            const visible = year === null || r.year === year;
            const groupVisible = year === null || (key === "year" ? Number(g) === year : rows.some((x) => groupOf(x, key) === g && x.year === year));
            const n = year === null ? counts.get(g) : rows.filter((x) => groupOf(x, key) === g && x.year === year).length;
            return (
              <Fragment key={r.i}>
                {head && (
                  <tr className="group-row" hidden={!groupVisible}>
                    <td colSpan={4} className="t-data fg2">
                      {fill(key === "year" ? ui.sort.groupRowByYear : ui.sort.groupRowByOther, { group: g, n: n ?? 0 })}
                    </td>
                  </tr>
                )}
                <m.tr
                  layout={motion ? "position" : false}
                  transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                  className="hov"
                  hidden={!visible}
                  style={{ opacity: active && r.committee !== active ? 0.35 : 1 }}
                >
                  <td className="c-subj">
                    {r.conference}
                    {r.conferenceFull && <span className="sub-sm">{r.conferenceFull}</span>}
                  </td>
                  <td className="c-sm">
                    {r.committee}
                    {r.committeeFull && <span className="fg2"> ({r.committeeFull})</span>}
                  </td>
                  <td className="c-sm t-label">{r.award}</td>
                  <td className="c-year">{r.year}</td>
                </m.tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

/* ── Figure 2, the globe ── */

const deg = Math.PI / 180;

function GlobeDrawing({
  W,
  H,
  R,
  cy,
  step,
  labels,
  variant,
}: {
  W: number;
  H: number;
  R: number;
  cy: number;
  step: number;
  labels: string[];
  variant: "desk" | "phone";
}) {
  const lats: number[] = [];
  for (let p = -90 + step; p < 90; p += step) lats.push(p);
  const lons: number[] = [];
  for (let l = -90; l < 90; l += step) lons.push(l);
  const labelLats = variant === "desk" ? [60, 30, 0, -30, -60] : [30, 0, -30];
  return (
    <FigureBox w={W} h={H} variant={variant} className="globe">
      <Svg w={W} h={H} fade>
        <circle className="hl" cx={0} cy={cy} r={R} />
        {lats.map((p) => {
          const y = cy - R * Math.sin(p * deg);
          const hw = R * Math.cos(p * deg);
          return <line key={p} className="hl" x1={-hw} x2={hw} y1={y} y2={y} />;
        })}
        {lons.map((l) => (
          <path
            key={l}
            className="hl globe-mer"
            data-lon={l}
            d={`M 0 ${cy - R} A ${R} ${R} 0 0 1 0 ${cy + R}`}
            style={{ transform: `scaleX(${Math.sin(l * deg).toFixed(4)})` }}
          />
        ))}
      </Svg>
      <Wipe axis="y">
        <Svg w={W} h={H}>
          <path className="ln" d={`M 0 0 L 0 ${H}`} />
        </Svg>
      </Wipe>
      {labelLats.map((p, i) => (
        <FLabel
          key={p}
          x={10}
          y={cy - R * Math.sin(p * deg)}
          w={W}
          h={H}
          valign="middle"
          at={(cy - R * Math.sin(p * deg)) / H}
          className="t-data fg2"
        >
          {labels[i]}
        </FLabel>
      ))}
    </FigureBox>
  );
}

export function Globe({ side }: { side: ReactNode }) {
  const { motion, fine } = useMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !motion) return;
    const mers = Array.from(root.querySelectorAll<SVGPathElement>(".globe-mer"));
    const lon = mers.map((p) => Number(p.dataset.lon));
    let theta = 0;
    let target = 0;
    let raf = 0;
    const render = () => {
      theta += (target - theta) * 0.12;
      mers.forEach((p, i) => {
        p.style.transform = `scaleX(${Math.sin((lon[i] + theta) * deg).toFixed(4)})`;
      });
      if (Math.abs(target - theta) > 0.01) raf = requestAnimationFrame(render);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    let st: ScrollTrigger | null = null;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      target = ((e.clientX - r.left) / r.width - 0.5) * 40;
      kick();
    };
    if (fine) {
      // Listen only while the figure is on screen.
      st = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (s) => {
          if (s.isActive) root.addEventListener("pointermove", onMove);
          else root.removeEventListener("pointermove", onMove);
        },
      });
    } else {
      st = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (s) => {
          target = (s.progress - 0.5) * 24;
          kick();
        },
      });
    }
    return () => {
      st?.kill();
      root.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      mers.forEach((p, i) => {
        p.style.transform = `scaleX(${Math.sin(lon[i] * deg).toFixed(4)})`;
      });
    };
  }, [motion, fine]);

  return (
    <div className="globe-block" ref={ref}>
      <GlobeDrawing W={1110} H={800} R={360} cy={400} step={15} labels={site.ui.figures.globe.desktop} variant="desk" />
      <GlobeDrawing W={350} H={540} R={250} cy={270} step={30} labels={site.ui.figures.globe.phone} variant="phone" />
      {side}
    </div>
  );
}
