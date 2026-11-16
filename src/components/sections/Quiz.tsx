"use client";

import { AnimatePresence, motion as m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { fill } from "@/lib/content";
import { useMotion } from "../motion/MotionProvider";
import { FigureBox, FLabel, Svg, Wipe } from "../primitives";

const q = site.ui.quizzing;
const questions = site.quiz.questions;
const nodes = q.nodes;

const GEO = {
  desk: {
    W: 1110,
    H: 440,
    f: 24,
    pts: [
      [150, 110],
      [320, 290],
      [500, 100],
      [670, 310],
      [840, 120],
      [1000, 300],
      [860, 400],
    ],
    entry: "M 0 0 L 0 40 C 0 90 90 110 150 110",
    /** Where each node's label sits: a = above, b = below, r = right, l = left. */
    place: ["a", "b", "a", "b", "a", "r", "b"],
  },
  phone: {
    W: 350,
    H: 280,
    f: 16,
    pts: [
      [50, 70],
      [100, 170],
      [150, 60],
      [200, 180],
      [250, 70],
      [310, 170],
      [250, 240],
    ],
    entry: "M 0 0 L 0 20 C 0 50 25 70 50 70",
    place: ["r", "b", "a", "b", "a", "l", "b"],
  },
};

const nodeFor = (subject: string) => nodes.findIndex((n) => n.interest === subject);

function Constellation({
  v,
  current,
  dotIndex,
  animate,
}: {
  v: "desk" | "phone";
  current: number;
  dotIndex: number;
  animate: boolean;
}) {
  const g = GEO[v];
  const { W, H, f, pts } = g;
  const geo = pts.slice(0, 6).map(([x, y]) => `L ${x} ${y}`).join(" ");
  const out = `${g.entry} ${geo}`;
  const [gx, gy] = pts[5];
  const [rx, ry] = pts[6];
  const back = `M ${gx} ${gy} L ${rx} ${ry} L ${f} ${ry} A ${f} ${f} 0 0 0 0 ${ry + f} L 0 ${H}`;
  const [dx, dy] = pts[dotIndex];
  return (
    <FigureBox w={W} h={H} variant={v} className="constellation">
      <Wipe axis="x" from={0} to={0.75}>
        <Svg w={W} h={H}>
          <path className="ln" d={out} />
        </Svg>
      </Wipe>
      <Wipe axis="-x" from={0.75} to={1}>
        <Svg w={W} h={H}>
          <path className="ln" d={back} />
        </Svg>
      </Wipe>
      {pts.map(([x, y], i) => (
        <span key={i} className="mark-ring" style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }} data-at={0.05 + (x / W) * 0.7} />
      ))}
      {v === "desk" &&
        pts.map(([x, y], i) => (
          <FLabel
            key={i}
            x={g.place[i] === "r" ? x + 14 : g.place[i] === "l" ? x - 14 : x}
            y={g.place[i] === "b" ? y + 14 : g.place[i] === "a" ? y - 14 : y}
            w={W}
            h={H}
            align={g.place[i] === "r" ? "left" : g.place[i] === "l" ? "right" : "center"}
            valign={g.place[i] === "b" ? "top" : g.place[i] === "a" ? "bottom" : "middle"}
            at={0.1 + (x / W) * 0.7}
            className={`t-small node-label ${i === current ? "is-current" : ""}`}
          >
            {nodes[i].label}
          </FLabel>
        ))}
      {v === "phone" && (
        // Phone: no label beside a node; the current subject is named once at the figure's top left (review 1, item 1).
        <span className="quiz-current t-small">
          <AnimatePresence initial={false}>
            <m.span
              key={current}
              className="quiz-current-name"
              initial={animate ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={animate ? { opacity: 0 } : undefined}
              transition={{ duration: 0.15 }}
            >
              {nodes[current].label}
            </m.span>
          </AnimatePresence>
        </span>
      )}
      <m.span
        className="quiz-dot"
        style={{ left: `${(dx / W) * 100}%`, top: `${(dy / H) * 100}%` }}
        layout={animate ? "position" : false}
        transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
      />
    </FigureBox>
  );
}

export function Quiz() {
  const { motion } = useMotion();
  const [qi, setQi] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [moved, setMoved] = useState(false);
  const [announce, setAnnounce] = useState("");
  const headRef = useRef<HTMLParagraphElement>(null);
  const focusNext = useRef(false);

  const question = questions[qi];
  const node = nodeFor(question.subject);
  // The dot rests on General knowledge until the first answer, then sits on the current subject.
  const dotIndex = moved ? node : 0;

  useEffect(() => {
    if (focusNext.current) {
      headRef.current?.focus();
      focusNext.current = false;
    }
  }, [qi, done]);

  const choose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    setMoved(true);
    if (i === question.answerIndex) setScore((s) => s + 1);
    setAnnounce(fill(q.announce, { chosen: question.options[i], correct: question.options[question.answerIndex] }));
  };

  const next = () => {
    focusNext.current = true;
    if (qi === questions.length - 1) {
      setDone(true);
      return;
    }
    setQi(qi + 1);
    setChosen(null);
    setAnnounce("");
  };

  const restart = () => {
    focusNext.current = true;
    setQi(0);
    setChosen(null);
    setScore(0);
    setDone(false);
    setMoved(false);
    setAnnounce("");
  };

  return (
    <>
      <div className="quiz-fig">
        <Constellation v="desk" current={dotIndex} dotIndex={dotIndex} animate={motion} />
        <Constellation v="phone" current={dotIndex} dotIndex={dotIndex} animate={motion} />
      </div>
      <div className="run pt-fig pb-block">
        <span aria-hidden="true" className="spine" data-spine="" />
        <div className="grid10">
          <div className="col quiz-panel" style={{ ["--cs" as string]: 1, ["--ce" as string]: 8 }}>
            {done ? (
              <div>
                <p className="t-title2" tabIndex={-1} ref={headRef}>
                  {fill(q.result, { total: questions.length, n: score })}
                </p>
                <button type="button" className="tbtn" onClick={restart} style={{ marginTop: 16 }}>
                  <span className="u">{q.startAgain}</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="t-data fg2 quiz-meta" tabIndex={-1} ref={headRef}>
                  <span>{nodes[node]?.label}</span>
                  <span>{fill(q.questionCounter, { n: qi + 1, total: questions.length })}</span>
                </p>
                <p className="t-title2 quiz-q">{question.question}</p>
                <ul className="quiz-options">
                  {question.options.map((o, i) => {
                    const isChosen = chosen === i;
                    const isRight = chosen !== null && i === question.answerIndex;
                    return (
                      <li key={o} className={isRight ? "is-right" : ""}>
                        <button type="button" onClick={() => choose(i)} aria-disabled={chosen !== null} className="quiz-opt">
                          <span className="t-data fg2 quiz-letter">{q.optionLetters[i]}</span>
                          <span className="t-body quiz-text">{o}</span>
                          <span className="quiz-tags t-data">
                            {isChosen && <span className="fg2">{q.yourAnswer}</span>}
                            {isRight && <span>{q.correctAnswer}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {chosen !== null && (
                  <m.div
                    className="quiz-after"
                    initial={motion ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="t-body measure">
                      {question.explanation}{" "}
                      <a className="ilink" href={question.source.url} target="_blank" rel="noopener">
                        {question.source.label}
                      </a>
                    </p>
                    <button type="button" className="btn btn-secondary" onClick={next} style={{ marginTop: 24 }}>
                      {q.next}
                    </button>
                  </m.div>
                )}
              </div>
            )}
            <p className="sr-only" aria-live="polite">
              {announce}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
