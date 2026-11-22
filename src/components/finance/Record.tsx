import Image from "next/image";
import { organisations, site } from "@/content/site";

const ui = site.ui;
const FINANCE = site.competitions.filter((c) => c.domain === "finance" || c.domain === "pitch");
const ONGOING = FINANCE.filter((c) => c.ongoing);


/** An organiser's mark, small, on a light plate so dark marks read on the dark ground. Never above 28px. */
function Mark({ org }: { org?: string }) {
  const o = org ? organisations[org] : undefined;
  if (!o?.logo) return null;
  const native: Record<string, [number, number]> = {
    "/logos/srcc.png": [622, 121],
    "/logos/wharton.svg": [864, 217],
  };
  const [w, h] = native[o.logo] ?? [200, 60];
  const H = 18;
  return (
    <span className="mark">
      <Image src={o.logo} alt={o.name} width={Math.round((w / h) * H)} height={H} />
    </span>
  );
}

export function Ongoing() {
  return (
    <section className="ongoing" aria-labelledby="ongoing-title">
      <h2 id="ongoing-title" className="heading ongoing__title">
        {ui.finance.inProgressHeading}
      </h2>
      <ul className="ongoing__list">
        {ONGOING.map((c) => (
          <li key={c.name} className="ongoing__row">
            <p className="ongoing__status">
              <span className="pulse" aria-hidden="true" />
              {c.year}
            </p>
            <h3 className="ongoing__name">{c.name}</h3>
            <p className="ongoing__result">{c.results.join(" ")}</p>
            {c.detail ? (
              <p className="ongoing__detail">{c.detail.text}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Record() {
  return (
    <section className="record" aria-labelledby="record-title">
      <h2 id="record-title" className="heading record__title">
        {ui.finance.recordHeading}
      </h2>
      <ol className="record__list">
        {FINANCE.map((c) => (
          <li key={c.name} className="record__row">
            <span className="record__year">{c.year}</span>
            <span className="record__name">{c.name}</span>
            <span className="record__result">
              {c.results.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </span>
            <span className="record__mark">{c.org === "wharton" || c.org === "srcc" ? <Mark org={c.org} /> : null}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
