import { site } from "@/content/site";
import { interest, stat } from "@/lib/content";
import { ChapterTitle, Col, EditableText, Run } from "../primitives";

const slots = site.ui.placeholder.slots;

/** A fixed pseudo-random sequence, the same on every build. */
function lengths(n: number, min: number, max: number) {
  let s = 20261115;
  return Array.from({ length: n }, () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return Math.round(min + (s / 2147483648) * (max - min));
  });
}

function Stack({ v }: { v: "desk" | "phone" }) {
  const desk = v === "desk";
  const step = desk ? 3 : 2;
  const gap = desk ? 12 : 8;
  // Lengths mean nothing. Every mark keeps its full length; on tablet and desktop the counts
  // sit clear of the marks (note column on desktop, x = 104 on tablet).
  const L = desk
    ? lengths(400, 28, 92)
    : lengths(400, 20, 64).map((l, i) => (i % 50 === 49 ? Math.min(l, 44) : l));
  const yOf = (i: number) => i * step + Math.floor(i / 50) * gap + 0.5;
  const H = Math.ceil(yOf(399) + 1);
  const W = desk ? 140 : 110;
  const d = L.map((len, i) => `M 1 ${yOf(i)} H ${len}`).join(" ");
  return (
    <div className={`stack stack-${v}`} style={{ height: H, width: W }} data-figure="" aria-hidden="true">
      <div className="wipe" data-wipe="y">
        <div className="wipe-inner">
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ left: 12, top: 12, width: W, height: H }}>
            <path d={d} className="stack-marks" />
          </svg>
        </div>
      </div>
      {Array.from({ length: 8 }, (_, g) => {
        const y = yOf(g * 50 + 49);
        return (
          <span
            key={g}
            className={`t-data fg2 stack-count ${desk ? "is-desk" : ""}`}
            style={desk ? { top: y - 1 } : { top: y, left: 76 }}
            data-at={y / H}
          >
            {(g + 1) * 50}
          </span>
        );
      })}
    </div>
  );
}

/** Reading, with the stack of 400; then Tennis (§3.10, §0.1 item 13). */
export function Reading() {
  const reading = interest("reading");
  const tennis = interest("tennis");
  const books = stat("books");
  return (
    <section id="reading" aria-labelledby="reading-title" className="chapter reading" data-chapter="reading">
      <Run className="reading-block">
        <div className="reading-copy">
          <ChapterTitle id="reading" />
          <p className="t-numeral reading-num">{books.value}</p>
          <p className="t-body measure">{reading.evidence[0]?.text}</p>
          <div className="reading-ph-desk">
            <EditableText value={reading.description} slot={slots.reading} />
          </div>
        </div>
        <div className="stack-band">
          <Stack v="desk" />
          <Stack v="phone" />
          <span className="stack-sticky-track" aria-hidden="true">
            <span className="t-title2 stack-sticky">{books.value}</span>
          </span>
        </div>
        <div className="reading-ph-phone">
          <EditableText value={reading.description} slot={slots.reading} />
        </div>
      </Run>
      <Run className="tennis">
        <div className="grid10">
          <Col d={[3, 8]} t={[1, 4]}>
            <h3 className="t-title2 italic sub">{site.ui.reading.tennisHeading}</h3>
            {tennis.statedLine && <p className="t-body measure">{tennis.statedLine}</p>}
            <div style={{ marginTop: 32 }}>
              <EditableText value={tennis.description} slot={slots.tennis} />
            </div>
          </Col>
        </div>
      </Run>
    </section>
  );
}
