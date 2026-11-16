/**
 * A figure whose digits roll and settle when its destination is hovered or focused.
 * The real value is read by assistive technology; the rolling strips are hidden from it.
 */
export function Roll({ value }: { value: string }) {
  return (
    <span className="roll">
      <span className="sr-only">{value}</span>
      <span className="roll__visual" aria-hidden="true">
        {Array.from(value).map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
          const d = Number(ch);
          // d+1 … d+9, d, d+1: the strip ends on the real digit, with one spare for the overshoot.
          const strip = [...Array.from({ length: 9 }, (_, k) => (d + k + 1) % 10), d, (d + 1) % 10];
          return (
            <span key={i} className="roll__d" style={{ ["--i" as string]: i }}>
              <span className="roll__strip">
                {strip.map((n, k) => (
                  <span key={k}>{n}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
