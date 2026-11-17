import Image from "next/image";
import { organisations } from "@/content/site";

/** Native pixel sizes of the official logo files, so the plate never distorts them. */
const NATIVE: Record<string, [number, number]> = {
  "/logos/cbse.png": [173, 200],
  "/logos/iit-delhi-white.png": [200, 200],
  "/logos/iit-madras.png": [272, 60],
  "/logos/lotus-valley.jpg": [571, 219],
  "/logos/sof.jpg": [118, 66],
  "/logos/srcc.png": [622, 121],
  "/logos/wharton.svg": [864, 217],
};

/**
 * An organisation's official mark, unmodified, small (a 28px plate, 18px mark), on a light plate
 * so dark marks read on the dark ground. It only shows where something took place.
 */
export function Mark({ org }: { org?: string | null }) {
  const o = org ? organisations[org] : undefined;
  if (!o?.logo) return null;
  const [w, h] = NATIVE[o.logo] ?? [200, 60];
  const H = 18;
  return (
    <span className={o.logoOnDark ? "mark mark--dark" : "mark"}>
      <Image src={o.logo} alt={o.name} width={Math.round((w / h) * H)} height={H} />
    </span>
  );
}
