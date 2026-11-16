"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/content/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { evenly, normalAt, samplePath, speedTrace, type Pt } from "@/lib/path";
import { useMotion } from "../motion/MotionProvider";
import { FigureBox, FLabel, Svg, Wipe } from "../primitives";

const figs = site.ui.figures;

/* ───────────── Figure 4, the route ───────────── */

const ROUTE = {
  desk: {
    W: 1110,
    H: 640,
    out: "M 0 0 L 0 60 C 0 180 120 250 260 250 L 430 250 C 540 250 600 130 700 130 L 900 130 A 45 45 0 0 1 900 220 L 700 220 A 45 45 0 0 1 700 130 L 960 130 C 1040 130 1070 200 1070 290 L 1070 360 C 1070 470 980 520 860 520",
    back: "M 860 520 L 150 520 C 60 520 0 560 0 640",
    rings: [110, 220, 330],
    centre: [560, 330],
    waypoints: [
      [330, 250],
      [700, 130],
      [700, 520],
      [430, 520],
    ],
    crossTicks: [150, 400, 520] as [number, number, number],
    tape: { x: 200, step: 26, labels: figs.route.headingTape, every: 3 },
  },
  phone: {
    W: 350,
    H: 520,
    out: "M 0 0 L 0 40 C 0 120 60 160 140 160 L 280 160 A 32 32 0 0 1 280 224 L 190 224 A 32 32 0 0 1 190 160 L 290 160 C 335 160 340 220 340 280 L 340 330 C 340 400 290 430 220 430",
    back: "M 220 430 L 90 430 C 40 430 0 460 0 520",
    rings: [90, 170],
    centre: [180, 290],
    waypoints: [
      [110, 160],
      [340, 300],
      [160, 430],
    ],
    crossTicks: [90, 200, 430] as [number, number, number],
    tape: { x: 60, step: 24, labels: figs.route.headingTapePhone, every: 3 },
  },
};

function Route({ v, tapeRef }: { v: "desk" | "phone"; tapeRef: (el: HTMLDivElement | null) => void }) {
  const g = ROUTE[v];
  const { W, H } = g;
  const tri = (x: number, y: number) => `M ${x} ${y - 6} L ${x + 5.5} ${y + 4} L ${x - 5.5} ${y + 4} Z`;
  const tapeW = W - g.tape.x;
  const n = Math.round(tapeW / g.tape.step);
  const ticks: { i: number; label?: string }[] = [];
  for (let i = -8; i <= n + 8; i++) {
    const lab = i % g.tape.every === 0 ? g.tape.labels[(((i / g.tape.every) % g.tape.labels.length) + g.tape.labels.length) % g.tape.labels.length] : undefined;
    ticks.push({ i, label: lab });
  }
  const [x0, x1, y] = g.crossTicks;
  const crosses: number[] = [];
  for (let x = x0; x <= x1; x += 40) crosses.push(x);
  return (
    <FigureBox w={W} h={H} variant={v} className="route">
      <Svg w={W} h={H} fade>
        <defs>
          <clipPath id={`route-clip-${v}`}>
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath={`url(#route-clip-${v})`}>
          {g.rings.map((r) => (
            <circle key={r} className="hl" cx={g.centre[0]} cy={g.centre[1]} r={r} />
          ))}
        </g>
        <circle className="hl" cx={g.centre[0]} cy={g.centre[1]} r={2.5} />
        {g.waypoints.map(([x, yy]) => (
          <path key={`${x}-${yy}`} className="hl route-wp" d={tri(x, yy)} />
        ))}
        {crosses.map((x) => (
          <line key={x} className="hl" x1={x} x2={x} y1={y - 6} y2={y + 6} />
        ))}
      </Svg>
      <div
        className="tape"
        style={{ left: `${(g.tape.x / W) * 100}%`, width: `${(tapeW / W) * 100}%` }}
        data-fade=""
      >
        <div className="tape-strip" ref={tapeRef}>
          {ticks.map((t) => (
            <span
              key={t.i}
              className={`tape-tick ${t.label ? "is-major" : ""}`}
              style={{ left: `${((t.i * g.tape.step) / tapeW) * 100}%` }}
            >
              {t.label && <span className="t-data">{t.label}</span>}
            </span>
          ))}
        </div>
      </div>
      <Wipe axis="x" from={0} to={0.6}>
        <Svg w={W} h={H}>
          <path className="ln" d={g.out} />
        </Svg>
      </Wipe>
      <Wipe axis="-x" from={0.6} to={1}>
        <Svg w={W} h={H}>
          <path className="ln" d={g.back} />
        </Svg>
      </Wipe>
    </FigureBox>
  );
}

export function RouteFigure() {
  const { motion, fine } = useMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const tapes = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = wrap.current;
    if (!root || !motion) return;
    const set = (f: number) => {
      // f in -1..1; ±130 viewBox units is 130/910 of the desktop tape (phone scaled the same way).
      tapes.current.forEach((t) => t && gsap.to(t, { xPercent: f * 14.3, duration: 0.4, ease: "mOut", overwrite: true }));
    };
    let st: ScrollTrigger;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width - 0.5) * 2);
    };
    if (fine) {
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
        onUpdate: (s) => set((s.progress - 0.5) * 2),
      });
    }
    return () => {
      st.kill();
      root.removeEventListener("pointermove", onMove);
    };
  }, [motion, fine]);

  return (
    <div ref={wrap} className="route-wrap">
      <Route v="desk" tapeRef={(el) => void (tapes.current[0] = el)} />
      <Route v="phone" tapeRef={(el) => void (tapes.current[1] = el)} />
    </div>
  );
}

/* ───────────── Figure 5, the circuit ───────────── */

const CIRCUIT = {
  desk: {
    W: 1110,
    H: 580,
    band: "M 150 120 L 150 380 C 150 430 180 450 230 450 L 430 450 C 480 450 500 420 490 380 C 480 340 510 310 560 320 C 620 332 640 400 710 420 C 800 446 920 440 980 390 C 1040 340 1060 270 1040 200 C 1022 138 960 110 900 126 C 850 140 840 190 790 196 C 730 204 715 140 660 116 C 600 90 520 60 430 60 L 210 60 C 170 60 150 80 150 120 Z",
    lap: "M 150 250 L 150 380 C 150 430 180 450 230 450 L 430 450 C 480 450 500 420 490 380 C 480 340 510 310 560 320 C 620 332 640 400 710 420 C 800 446 920 440 980 390 C 1040 340 1060 270 1040 200 C 1022 138 960 110 900 126 C 850 140 840 190 790 196 C 730 204 715 140 660 116 C 600 90 520 60 430 60 L 210 60 C 170 60 150 80 150 120 L 150 250",
    line: "M 0 0 L 0 40 C 0 120 150 80 150 170 L 150 380 C 150 430 180 450 230 450 L 430 450 C 480 450 500 420 490 380 C 480 340 510 310 560 320 C 620 332 640 400 710 420 C 800 446 920 440 980 390 C 1040 340 1060 270 1040 200 C 1022 138 960 110 900 126 C 850 140 840 190 790 196 C 730 204 715 140 660 116 C 600 90 520 60 430 60 L 210 60 C 170 60 150 80 150 120 L 150 330",
    exit: "M 150 330 C 150 430 0 400 0 500 L 0 580",
    trace: { x0: 230, x1: 1050, y0: 500, y1: 560 },
    band14: 14,
    centroid: { x: 600, y: 260 },
  },
  phone: {
    W: 350,
    H: 420,
    band: "M 60 90 L 60 250 C 60 280 80 290 110 290 L 200 290 C 230 290 240 270 250 250 C 262 226 290 230 310 210 C 330 190 330 160 315 130 C 300 100 270 100 250 110 C 220 125 200 80 170 60 C 155 50 140 50 120 50 L 100 50 C 75 50 60 65 60 90 Z",
    lap: "M 60 170 L 60 250 C 60 280 80 290 110 290 L 200 290 C 230 290 240 270 250 250 C 262 226 290 230 310 210 C 330 190 330 160 315 130 C 300 100 270 100 250 110 C 220 125 200 80 170 60 C 155 50 140 50 120 50 L 100 50 C 75 50 60 65 60 90 L 60 170",
    line: "M 0 0 L 0 30 C 0 80 60 60 60 110 L 60 250 C 60 280 80 290 110 290 L 200 290 C 230 290 240 270 250 250 C 262 226 290 230 310 210 C 330 190 330 160 315 130 C 300 100 270 100 250 110 C 220 125 200 80 170 60 C 155 50 140 50 120 50 L 100 50 C 75 50 60 65 60 90 L 60 220",
    exit: "M 60 220 C 60 300 0 280 0 340 L 0 420",
    trace: { x0: 60, x1: 330, y0: 330, y1: 390 },
    band14: 10,
    centroid: { x: 190, y: 170 },
  },
};

const N = 360;

function useCircuitGeo(v: "desk" | "phone") {
  return useMemo(() => {
    const g = CIRCUIT[v];
    const loop = evenly(samplePath(g.lap, 40), N);
    const speed = speedTrace(loop);
    const { x0, x1, y0, y1 } = g.trace;
    const tracePts = speed.map((s, k) => `${(x0 + ((x1 - x0) * k) / N).toFixed(1)} ${(y1 - s * (y1 - y0)).toFixed(1)}`);
    const sectorAt = [N / 3, (2 * N) / 3].map(Math.round);
    const tick = (k: number, len: number) => {
      const p = loop[k];
      const nn = normalAt(loop, k);
      return { a: { x: p.x - nn.x * len, y: p.y - nn.y * len }, b: { x: p.x + nn.x * len, y: p.y + nn.y * len } };
    };
    const labelAt = [N / 6, N / 2, (5 * N) / 6].map((k) => {
      const kk = Math.round(k);
      const p = loop[kk];
      let nn = normalAt(loop, kk);
      // Point the label away from the middle of the circuit.
      if ((p.x - g.centroid.x) * nn.x + (p.y - g.centroid.y) * nn.y < 0) nn = { x: -nn.x, y: -nn.y };
      const off = v === "desk" ? 30 : 20;
      return { x: p.x + nn.x * off, y: p.y + nn.y * off, nx: nn.x };
    });
    return { g, loop, trace: `M ${tracePts.join(" L ")}`, sectorAt, tick, labelAt };
  }, [v]);
}

function Circuit({
  v,
  dotRef,
  cursorRef,
}: {
  v: "desk" | "phone";
  dotRef: (el: HTMLSpanElement | null) => void;
  cursorRef: (el: HTMLSpanElement | null) => void;
}) {
  const { g, loop, trace, sectorAt, tick, labelAt } = useCircuitGeo(v);
  const { W, H } = g;
  const start = tick(0, g.band14 / 2 + 2);
  const { x0, x1, y0, y1 } = g.trace;
  const pt = (p: Pt) => ({ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` });
  return (
    <FigureBox w={W} h={H} variant={v} className="circuit">
      <Svg w={W} h={H} fade>
        <path d={g.band} fill="none" stroke="var(--rule)" strokeWidth={g.band14} strokeLinejoin="round" />
        {[y0, (y0 + y1) / 2, y1].map((y) => (
          <line key={y} className="hl" x1={x0} x2={x1} y1={y} y2={y} />
        ))}
        <path d={trace} className="trace" />
        {sectorAt.map((k) => {
          const x = x0 + ((x1 - x0) * k) / N;
          return <line key={k} className="mark" x1={x} x2={x} y1={y0 - 6} y2={y1 + 6} />;
        })}
        <line className="mark" x1={start.a.x} y1={start.a.y} x2={start.b.x} y2={start.b.y} />
        {sectorAt.map((k) => {
          const t = tick(k, g.band14 / 2 + 2);
          return <line key={k} className="mark" x1={t.a.x} y1={t.a.y} x2={t.b.x} y2={t.b.y} />;
        })}
      </Svg>
      <Wipe axis="x" from={0} to={0.85}>
        <Svg w={W} h={H}>
          <path className="ln" d={g.line} />
        </Svg>
      </Wipe>
      <Wipe axis="-x" from={0.85} to={1}>
        <Svg w={W} h={H}>
          <path className="ln" d={g.exit} />
        </Svg>
      </Wipe>
      {labelAt.map((l, i) =>
        v === "phone" && i === 1 ? null : (
          <FLabel
            key={i}
            x={l.x}
            y={l.y}
            w={W}
            h={H}
            align={l.nx > 0.3 ? "left" : l.nx < -0.3 ? "right" : "center"}
            valign="middle"
            at={0.3 + i * 0.2}
            className="t-data fg2"
          >
            {figs.circuit.sectors[i]}
          </FLabel>
        ),
      )}
      <span className="lap-dot mark-dot" ref={dotRef} style={pt(loop[0])} />
      <span
        className="lap-cursor"
        ref={cursorRef}
        style={{ left: `${(x0 / W) * 100}%`, top: `${((y0 - 6) / H) * 100}%`, height: `${((y1 - y0 + 12) / H) * 100}%` }}
      />
    </FigureBox>
  );
}

export function CircuitFigure() {
  const { motion, fine } = useMotion();
  const desk = useCircuitGeo("desk");
  const phone = useCircuitGeo("phone");
  const wrap = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const cursors = useRef<(HTMLSpanElement | null)[]>([]);
  const [running, setRunning] = useState(false);
  const frac = useRef(0);

  // Place the dot at a fraction of the lap (transform only; the dot rests on the start line).
  const place = (f: number) => {
    frac.current = f;
    [desk, phone].forEach((geo, i) => {
      const dot = dots.current[i];
      const cur = cursors.current[i];
      const box = dot?.parentElement;
      if (!dot || !box || !box.offsetWidth) return;
      const k = Math.min(N - 1, Math.max(0, Math.round(f * N))) % N;
      const p = geo.loop[k];
      const s = box.offsetWidth / geo.g.W;
      const p0 = geo.loop[0];
      gsap.set(dot, { x: (p.x - p0.x) * s, y: (p.y - p0.y) * s });
      if (cur) gsap.set(cur, { x: ((geo.g.trace.x1 - geo.g.trace.x0) * (k / N)) * s });
    });
  };

  useEffect(() => {
    const root = wrap.current;
    if (!root || !fine) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = root.getBoundingClientRect();
      place(Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width)));
    };
    root.addEventListener("pointermove", onMove);
    return () => root.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fine]);

  // Touch: tap runs one lap in 6s; tap again stops.
  useEffect(() => {
    if (!running) return;
    const tween = gsap.to(frac, {
      current: 1,
      duration: 6 * (1 - frac.current),
      ease: "none",
      onUpdate: () => place(frac.current),
      onComplete: () => {
        place(0);
        setRunning(false);
      },
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div
      ref={wrap}
      className="circuit-wrap"
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" || !motion) return;
        if (running) setRunning(false);
        else {
          if (frac.current >= 0.999) frac.current = 0;
          setRunning(true);
        }
      }}
    >
      <Circuit v="desk" dotRef={(el) => void (dots.current[0] = el)} cursorRef={(el) => void (cursors.current[0] = el)} />
      <Circuit v="phone" dotRef={(el) => void (dots.current[1] = el)} cursorRef={(el) => void (cursors.current[1] = el)} />
    </div>
  );
}
