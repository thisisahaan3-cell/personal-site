"use client";

import { useRef, useState } from "react";
import { site } from "@/content/site";
import { Chapter, ChapterHead, Run } from "../primitives";

const c = site.contact;
const ui = site.ui;

export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.email);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Chapter id="contact">
      <ChapterHead id="contact" />
      <div className="run email-run" data-figure="">
        <span aria-hidden="true" className="spine email-spine" data-spine="" />
        <span className="email-wrap">
          <a className="t-email email-link" href={`mailto:${c.email}`}>
            {c.email}
          </a>
          <span className="email-tail" aria-hidden="true">
            <svg className="email-fillet" viewBox="0 0 1 1" preserveAspectRatio="none">
              <path className="ln" d="M 0 0 A 1 1 0 0 0 1 1" />
            </svg>
            <span className="email-line" data-scale="x" data-from={0.75} data-to={1} />
            <span className="email-dot" data-at={0.99} />
          </span>
        </span>
      </div>
      <Run spine={false} className="contact-actions">
        <div className="contact-buttons">
          <a className="btn btn-primary" href={c.resumeFile} download>
            {ui.nav.downloadResume}
          </a>
          <button type="button" className="btn btn-secondary" onClick={copy}>
            {copied ? ui.contact.copied : ui.contact.copyEmail}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? ui.contact.copied : ""}
        </p>
        <p className="t-small fg2" style={{ marginTop: 32 }}>
          {c.referencesLine}
        </p>
      </Run>
    </Chapter>
  );
}
