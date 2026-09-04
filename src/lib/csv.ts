import type { AppState, Customer, Lang } from "../types";
import { txnDirection } from "./calc";

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCSV(filename: string, rows: (string | number)[][]): void {
  const content = "\uFEFF" + rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTransactionsCSV(state: AppState): void {
  const lang: Lang = state.settings.language;
  const digits = state.settings.language === "bn" && state.settings.bengaliDigits;
  const header = lang === "bn"
    ? ["তারিখ", "নাম", "ফোন", "ধরন", "পরিমাণ (টাকা)", "নোট"]
    : ["Date", "Name", "Phone", "Type", "Amount (Taka)", "Note"];
  const rows = state.txns
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t) => {
      const c = state.customers.find((x) => x.id === t.customerId);
      const meta = txnDirection(t.type) === "give" ? "দেনা" : "পাওনা";
      return [
        t.date,
        c?.name ?? "-",
        c?.phone ?? "",
        lang === "bn" ? meta : txnDirection(t.type) === "give" ? "Give" : "Take",
        t.amount,
        t.note ?? "",
      ];
    });
  downloadCSV(`mmt-transactions-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
  void digits;
}

export function exportCustomersCSV(state: AppState, balances: Record<string, number>): void {
  const lang = state.settings.language;
  const header = lang === "bn"
    ? ["নাম", "ফোন", "ঠিকানা", "ধরন", "ব্যালেন্স (টাকা)"]
    : ["Name", "Phone", "Address", "Type", "Balance (Taka)"];
  const rows = state.customers.map((c: Customer) => [
    c.name,
    c.phone,
    c.address,
    c.type === "customer" ? (lang === "bn" ? "গ্রাহক" : "Customer") : lang === "bn" ? "সাপ্লায়ার" : "Supplier",
    balances[c.id] || 0,
  ]);
  downloadCSV(`mmt-customers-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows]);
}
