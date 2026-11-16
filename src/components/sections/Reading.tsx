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
  // Lengths mean nothing; the last mark of each group is kept short so its count reads clear.
  const L = lengths(400, desk ? 28 : 20, desk ? 92 : 64).map((l, i) => (i % 50 === 49 ? Math.min(l, desk ? 64 : 44) : l));
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
          <span key={g} className={`t-data fg2 stack-count ${desk ? "is-right" : ""}`} style={{ top: y, left: desk ? 108 : 76 }} data-at={y / H}>
            {(g + 1) * 50}
          </span>
        );
      })}
    </div>
  );
}

function Court({ v }: { v: "desk" | "phone" }) {
  const desk = v === "desk";
  const W = desk ? 234 : 195;
  const H = desk ? 108 : 90;
  const u = W / 78;
  const singles = 4.5 * u;
  const service = 21 * u;
  return (
    <div className={`court court-${v}`} style={{ width: W, height: H }} data-figure="" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} data-fade="">
        <line className="hl" x1={W / 2} x2={W / 2} y1={0} y2={H} />
        <line className="hl" x1={0} x2={W} y1={singles} y2={singles} />
        <line className="hl" x1={0} x2={W} y1={H - singles} y2={H - singles} />
        <line className="hl" x1={W / 2 - service} x2={W / 2 - service} y1={singles} y2={H - singles} />
        <line className="hl" x1={W / 2 + service} x2={W / 2 + service} y1={singles} y2={H - singles} />
        <line className="hl" x1={W / 2 - service} x2={W / 2 + service} y1={H / 2} y2={H / 2} />
      </svg>
      <span className="court-side court-top" data-scale="x" data-from={0} data-to={0.4} />
      <span className="court-side court-right" data-scale="y" data-from={0.4} data-to={0.6} />
      <span className="court-side court-bottom" data-scale="-x" data-from={0.6} data-to={1} />
    </div>
  );
}

/** Reading, with the stack of 400 and the tennis court (§3.10). */
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
      <Run className="court-gap" />
      <div className="court-row">
        <Court v="desk" />
        <Court v="phone" />
        <Run className="court-copy">
          <div className="grid10">
            <Col d={[6, 10]}>
              <h3 className="t-title2 italic sub">{site.ui.reading.tennisHeading}</h3>
              {tennis.statedLine && (
                <p className="t-small fg2" style={{ marginBottom: 24 }}>
                  {tennis.statedLine}
                </p>
              )}
              <EditableText value={tennis.description} slot={slots.tennis} compact />
            </Col>
          </div>
        </Run>
      </div>
      <Run className="court-after" />
    </section>
  );
}
