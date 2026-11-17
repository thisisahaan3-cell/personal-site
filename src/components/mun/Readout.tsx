import { site } from "@/content/site";
import type { Seat } from "./seats";

const ui = site.ui.modelUn;

/** What a raised placard says: its seat, then the entry exactly as written. */
export function Readout({ seat }: { seat: Seat }) {
  const [first, ...rest] = seat.lines;
  return (
    <>
      <span className="readout__kind">{seat.kind === "dais" ? ui.dais : seat.kind === "bench" ? ui.bench : ui.floor}</span>
      <span className="readout__title">{first}</span>
      {rest.map((l, i) => (
        <span key={i} className={l === seat.level ? "readout__award" : "readout__line"}>
          {l}
        </span>
      ))}
    </>
  );
}
