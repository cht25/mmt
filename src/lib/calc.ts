import type { AppState, Customer, Direction, Gateway, Txn, TxnType } from "../types";

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** Direction of a transaction from the business's point of view. */
export function txnDirection(t: TxnType): Direction {
  return t === "sale" || t === "payment_out" ? "give" : "take";
}

/**
 * Signed effect on a party's balance:
 * positive => party owes the business, negative => business owes the party.
 * - sale          : +amount (gave goods on credit)
 * - payment_in    : -amount (received money => reduces their due)
 * - purchase      : -amount (took goods, business owes)
 * - payment_out   : +amount (paid money => reduces business's debt)
 */
export function txnEffect(t: TxnType, amount: number): number {
  return t === "sale" || t === "payment_out" ? amount : -amount;
}

/** Add opening balances as a synthetic pseudo customer. */
export function computeBalances(txns: Txn[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of txns) {
    map[t.customerId] = (map[t.customerId] || 0) + txnEffect(t.type, t.amount);
  }
  return map;
}

export function balanceOf(txns: Txn[], customerId: string): number {
  return txns.reduce((sum, t) => (t.customerId === customerId ? sum + txnEffect(t.type, t.amount) : sum), 0);
}

export function customerNet(balances: Record<string, number>, c: Customer): number {
  return balances[c.id] || 0;
}

export function sortKeyDate(a: Txn, b: Txn): number {
  return a.date === b.date ? a.createdAt - b.createdAt : a.date.localeCompare(b.date);
}

export function todayISO(): string {
  const d = new Date();
  return toISO(d);
}

export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function totalOf(txns: Txn[], type: TxnType, date?: string): number {
  let sum = 0;
  for (const t of txns) {
    if (t.type !== type) continue;
    if (date && t.date !== date) continue;
    sum += t.amount;
  }
  return sum;
}

export function sumFor(txns: Txn[], pred: (t: Txn) => boolean): number {
  return txns.filter(pred).reduce((s, t) => s + t.amount, 0);
}

export function toNumber(v: string | number): number {
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function defaultState(): AppState {
  return {
    settings: {
      shopName: "Mahi And Muhi Traders",
      ownerName: "",
      phone: "",
      address: "",
      language: "bn",
      bengaliDigits: false,
      dark: false,
      themeColor: "#0c6b4e",
      gateways: defaultGateways(),
    },
    customers: [],
    txns: [],
  };
}

export function defaultGateways(): Gateway[] {
  return [
    {
      id: "gw-bkash",
      name: "bKash",
      type: "mobile",
      accountNo: "017XX-XXXXXX",
      holder: "Mahi And Muhi Traders",
      instructions: "আদায়ের সময় রেফারেন্সে গ্রাহকের নাম দিন",
      color: "#d12053",
      enabled: true,
    },
    {
      id: "gw-nagad",
      name: "Nagad",
      type: "mobile",
      accountNo: "017XX-XXXXXX",
      holder: "Mahi And Muhi Traders",
      instructions: "",
      color: "#f6921e",
      enabled: true,
    },
    {
      id: "gw-rocket",
      name: "Rocket",
      type: "mobile",
      accountNo: "017XX-XXXXXXX",
      holder: "Mahi And Muhi Traders",
      instructions: "",
      color: "#8c3494",
      enabled: true,
    },
    {
      id: "gw-bank",
      name: "ব্যাংক একাউন্ট",
      type: "bank",
      accountNo: "XXXX-XXXX-XXXX",
      holder: "Mahi And Muhi Traders",
      instructions: "",
      color: "#16a34a",
      enabled: true,
    },
  ];
}
