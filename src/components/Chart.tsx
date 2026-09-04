import type { Txn } from "../types";
import { addDays, monthKey, todayISO } from "../lib/calc";

export interface DayStat {
  date: string;
  sale: number;
  received: number;
}

export function lastNDays(txns: Txn[], n: number): DayStat[] {
  const today = todayISO();
  const map: Record<string, DayStat> = {};
  const out: DayStat[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const item = { date, sale: 0, received: 0 };
    map[date] = item;
    out.push(item);
  }
  for (const t of txns) {
    const item = map[t.date];
    if (!item) continue;
    if (t.type === "sale") item.sale += t.amount;
    if (t.type === "payment_in") item.received += t.amount;
  }
  return out;
}

export function periodStats(txns: Txn[], from: string, to: string) {
  let sale = 0, received = 0, purchase = 0, paid = 0;
  for (const t of txns) {
    if (t.date < from || t.date > to) continue;
    if (t.type === "sale") sale += t.amount;
    else if (t.type === "payment_in") received += t.amount;
    else if (t.type === "purchase") purchase += t.amount;
    else if (t.type === "payment_out") paid += t.amount;
  }
  return { sale, received, purchase, paid };
}

export function monthlySeries(txns: Txn[]): { key: string; sale: number; received: number }[] {
  const map: Record<string, { key: string; sale: number; received: number }> = {};
  for (const t of txns) {
    const key = monthKey(t.date);
    if (!map[key]) map[key] = { key, sale: 0, received: 0 };
    if (t.type === "sale") map[key].sale += t.amount;
    if (t.type === "payment_in") map[key].received += t.amount;
  }
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
}

/** Simple line sparkline */
export function Sparkline({
  data,
  color = "var(--brand)",
  height = 64,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  if (data.length < 2) return null;
  const width = 100;
  const h = height;
  const max = Math.max(1, ...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = h - 4 - (v / max) * (h - 10);
    return `${x},${y}`;
  });
  const line = pts.join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${h}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      <polygon points={`0,${h} ${line} ${width},${h}`} fill={color} opacity={0.12} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chart7({ txns, labels }: { txns: Txn[]; labels?: [string, string] }) {
  const data = lastNDays(txns, 7);
  const [saleLabel, recLabel] = labels ?? ["বিক্রি", "আদায়"];
  const width = 320;
  const h = 150;
  const pad = 8;
  const max = Math.max(1, ...data.map((d) => Math.max(d.sale, d.received)));
  const step = (width - pad * 2) / Math.max(1, data.length - 1);
  return (
    <div className="mt-2">
      <svg viewBox={`0 0 ${width} ${h}`} className="h-auto w-full" aria-label="7 day chart">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={width - pad}
            y1={h - pad - f * (h - pad * 2)}
            y2={h - pad - f * (h - pad * 2)}
            stroke="currentColor"
            className="text-stone-200 dark:text-stone-700"
            strokeDasharray="3 4"
            strokeWidth={1}
          />
        ))}
        {data.map((d, i) => {
          const x = pad + i * step;
          const saleH = (d.sale / max) * (h - pad * 2);
          const recH = (d.received / max) * (h - pad * 2);
          return (
            <g key={d.date}>
              <rect
                x={x - 10}
                y={h - pad - saleH}
                width={18}
                height={Math.max(2, saleH)}
                rx={4}
                fill="var(--brand)"
                opacity={0.9}
              />
              <rect
                x={x + 4}
                y={h - pad - recH}
                width={12}
                height={Math.max(2, recH)}
                rx={3}
                fill="var(--brand)"
                opacity={0.28}
              />
              <text x={x} y={h - 1} textAnchor="middle" fontSize={9} className="fill-stone-400">
                {d.date.slice(8)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-stone-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--brand)]" /> {saleLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--brand)] opacity-30" /> {recLabel}
        </span>
      </div>
    </div>
  );
}
