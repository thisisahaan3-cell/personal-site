/**
 * Pointer position over an element in normalised device coordinates (-1..1, y up).
 * Kept apart from kit.ts so components can use it without pulling three.js into the page bundle.
 */
export function pointerNdcOf(e: { clientX: number; clientY: number }, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) };
}
