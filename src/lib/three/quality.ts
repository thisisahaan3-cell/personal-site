"use client";

import { useEffect, useState } from "react";

/**
 * How a 3D set piece runs on this device (design/v2.1-addendum.md §5).
 *
 *   "motion"  full set piece: scroll camera, pointer light, springs.
 *   "still"   reduced motion: one settled frame, no camera moves; selection still works (instant cuts).
 *   "flat"    no WebGL2, save-data, or a very small/low-memory phone: the still image (if any)
 *             and the hotspots as a plain DOM list. Also used if a model fails to load.
 *   "pending" before the first client render (server HTML renders the flat version's DOM too).
 */
export type SetPieceMode = "pending" | "motion" | "still" | "flat";

export type Quality = {
  /** Phone-sized viewport. */
  phone: boolean;
  /** Device pixel ratio cap: 1.75 desktop, 1.5 phone. */
  dpr: number;
  /** Real-time shadow maps (one PCF-soft key light). Off on phones and low-memory devices: baked shadows only. */
  shadows: boolean;
  shadowMapSize: number;
};

const PHONE_MAX = 760;

function deviceMemory() {
  return (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
}

function saveData() {
  return Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
}

let webgl2: boolean | null = null;
export function hasWebGL2() {
  if (webgl2 !== null) return webgl2;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    webgl2 = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }
  return webgl2;
}

export function detectQuality(): Quality {
  const phone = window.innerWidth < PHONE_MAX;
  const low = phone || deviceMemory() <= 4;
  return {
    phone,
    dpr: Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75),
    shadows: !low,
    shadowMapSize: phone ? 1024 : 2048,
  };
}

export function detectMode(): SetPieceMode {
  if (!hasWebGL2() || saveData()) return "flat";
  // A very small phone, or one with little memory, gets the flat version.
  if (window.innerWidth < 340 || deviceMemory() <= 2) return "flat";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "still";
  return "motion";
}

/** The set piece mode for this visitor; re-checked if reduced motion is switched while the page is open. */
export function useSetPieceMode(): SetPieceMode {
  const [mode, setMode] = useState<SetPieceMode>("pending");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setMode(detectMode());
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mode;
}
