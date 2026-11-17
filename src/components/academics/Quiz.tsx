"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { fill } from "@/lib/content";

const qui = site.ui.quizzing;
const ui = site.ui.academics;
const QUESTIONS = site.quiz.questions;
const KEYS: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };

/**
 * One question at a time from `quiz.questions`. Answer by click or with A to D (or 1 to 4);
 * the explanation and the source link then appear, and the tally above records the answer as a
 * candle: up for correct, down for not. Results are never stored or sent anywhere.
 */
export function Quiz() {
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [announce, setAnnounce] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const question = useRef<HTMLParagraphElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  const done = i >= QUESTIONS.length;
  const q = done ? null : QUESTIONS[i];

  const choose = (k: number) => {
    if (!q || chosen !== null) return;
    setChosen(k);
    setResults((r) => [...r, k === q.answerIndex]);
    setAnnounce(fill(qui.announce, { chosen: q.options[k], correct: q.options[q.answerIndex] }));
  };
  const next = () => {
    moved.current = true;
    setChosen(null);
    setAnnounce("");
    setI((n) => n + 1);
  };
  const restart = () => {
    moved.current = true;
    setResults([]);
    setChosen(null);
    setAnnounce("");
    setI(0);
  };

  // After moving on, put focus on the new question so keyboard users continue from there.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    question.current?.focus({ preventScroll: true });
  }, [i]);

  useEffect(() => {
    if (chosen !== null) nextBtn.current?.focus({ preventScroll: true });
  }, [chosen]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = KEYS[e.key.toLowerCase()];
    if (k !== undefined && chosen === null && q) {
      e.preventDefault();
      choose(k);
    }
  };

  const correct = results.filter(Boolean).length;

  return (
    <div className="quiz" ref={root} onKeyDown={onKey} aria-labelledby="quiz-title">
      <div className="quiz__top">
        <h3 id="quiz-title" className="quiz__title">
          {ui.quizHeading}
        </h3>
        <ol className="quiz__tally" aria-hidden="true">
          {QUESTIONS.map((qq, k) => (
            <li
              key={qq.id}
              className="quiz__candle"
              data-state={k < results.length ? (results[k] ? "up" : "down") : k === i ? "now" : undefined}
            />
          ))}
        </ol>
      </div>
      <p className="quiz__intro">{ui.quizIntro}</p>

      {q ? (
        <div className="quiz__card" key={q.id}>
          <p className="quiz__counter">{fill(qui.questionCounter, { n: i + 1, total: QUESTIONS.length })}</p>
          <p className="quiz__question" ref={question} tabIndex={-1}>
            {q.question}
          </p>
          <ol className="quiz__options">
            {q.options.map((o, k) => {
              const state =
                chosen === null ? undefined : k === q.answerIndex ? "correct" : k === chosen ? "wrong" : "other";
              return (
                <li key={o}>
                  <button
                    type="button"
                    className="quiz__option"
                    data-state={state}
                    aria-disabled={chosen !== null ? true : undefined}
                    onClick={() => choose(k)}
                  >
                    <span className="quiz__letter">{qui.optionLetters[k]}</span>
                    <span className="quiz__text">{o}</span>
                    {chosen !== null && (k === chosen || k === q.answerIndex) ? (
                      <span className="quiz__tag">{k === q.answerIndex ? qui.correctAnswer : qui.yourAnswer}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
          {chosen !== null ? (
            <div className="quiz__answer">
              <p className="quiz__explain">{q.explanation}</p>
              <p className="quiz__source">
                <span>{ui.sourceLabel}</span>{" "}
                <a href={q.source.url} target="_blank" rel="noopener noreferrer">
                  {q.source.label}
                </a>
              </p>
              <button type="button" className="quiz__next" ref={nextBtn} onClick={next}>
                {i + 1 < QUESTIONS.length ? qui.next : ui.quizFinish}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="quiz__card quiz__card--done">
          <p className="quiz__question quiz__result" ref={question} tabIndex={-1}>
            {fill(qui.result, { total: QUESTIONS.length, n: correct })}
          </p>
          <button type="button" className="quiz__next" onClick={restart}>
            {qui.startAgain}
          </button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
