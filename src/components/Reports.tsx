import { useMemo, useState } from "react";
import { CalendarRange, Printer } from "lucide-react";
import { useStore } from "../lib/store-context";
import { computeBalances, sortKeyDate } from "../lib/calc";
import { money, moneySigned, monthLabel, t } from "../lib/format";
import { TXN_META } from "../lib/i18n";
import { Badge, Button, Card } from "./ui";
import { Chart7, monthlySeries, periodStats } from "./Chart";
import { downloadCSV } from "../lib/csv";

export default function Reports() {
  const { state } = useStore();
  const lang = state.settings.language;
  const digits = state.settings.language === "bn" && state.settings.bengaliDigits;
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<"period" | "monthly" | "dues">("period");

  const balances = useMemo(() => computeBalances(state.txns), [state.txns]);

  const f = from || "0000-01-01";
  const tt = to || "9999-12-31";
  const stats = periodStats(state.txns, f, tt);
  const periodTxns = state.txns.filter((x) => x.date >= f && x.date <= tt);
  const days = Math.max(1, Math.ceil((new Date(tt).getTime() - new Date(f).getTime()) / 86400000) + 1);

  const months = monthlySeries(state.txns);

  const dueList = useMemo(
    () =>
      state.customers
        .map((c) => ({ c, bal: balances[c.id] || 0 }))
        .filter((x) => x.bal !== 0)
        .sort((a, b) => Math.abs(b.bal) - Math.abs(a.bal)),
    [state.customers, balances],
  );

  const byCustomer = useMemo(() => {
    const out: Record<string, { give: number; take: number; count: number }> = {};
    for (const t of periodTxns) {
      const o = (out[t.customerId] = out[t.customerId] || { give: 0, take: 0, count: 0 });
      o.count++;
      if (t.type === "sale" || t.type === "payment_out") o.give += t.amount;
      else o.take += t.amount;
    }
    return out;
  }, [periodTxns]);

  const exportReport = () => {
    const header =
      lang === "bn"
        ? ["তারিখ", "নাম", "ধরন", "পরিমাণ (টাকা)", "নোট"]
        : ["Date", "Name", "Type", "Amount (Taka)", "Note"];
    const rows = periodTxns
      .slice()
      .sort(sortKeyDate)
      .map((x) => {
        const c = state.customers.find((k) => k.id === x.customerId);
        return [
          x.date,
          c?.name ?? "",
          lang === "bn" ? TXN_META[x.type].bn : TXN_META[x.type].en,
          x.amount,
          x.note ?? "",
        ];
      });
    downloadCSV(`mmt-report-${f.slice(0, 10)}-${tt.slice(0, 10)}.csv`, [header, ...rows]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t(lang, "reports")}</h1>
          <p className="text-sm text-stone-400">{t(lang, "reportSummary")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            {t(lang, "exportCsv")}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={15} /> {t(lang, "print")}
          </Button>
        </div>
      </div>

      <div className="no-print flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          {(["period", "monthly", "dues"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
                mode === k ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-500"
              }`}
            >
              {k === "period" ? t(lang, "allTime") : k === "monthly" ? t(lang, "month") : t(lang, "dueCustomers")}
            </button>
          ))}
        </div>
        {mode === "period" && (
          <div className="flex items-center gap-2">
            <CalendarRange size={16} className="text-stone-400" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--brand)] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
            />
            <span className="text-stone-400">→</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--brand)] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
            />
          </div>
        )}
      </div>

      {mode === "period" && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <SmallStat label={lang === "bn" ? "মোট বিক্রি" : "Total sales"} value={money(stats.sale, state)} tone="green" />
            <SmallStat label={t(lang, "totalReceived")} value={money(stats.received, state)} tone="sky" />
            <SmallStat label={lang === "bn" ? "মোট কেনা" : "Total purchase"} value={money(stats.purchase, state)} tone="amber" />
            <SmallStat label={t(lang, "totalGiven")} value={money(stats.paid, state)} tone="rose" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-bold">{t(lang, "last7days")}</h2>
              <Chart7 txns={state.txns} labels={lang === "bn" ? ["বিক্রি", "আদায়"] : ["Sales", "Collected"]} />
              <p className="mt-3 text-xs text-stone-400">
                {t(lang, "days")}: {days} · {t(lang, "avgPerDay")}: {money(days ? stats.sale / Math.max(1, days) : 0, state)}
              </p>
            </Card>

            <Card className="p-5">
              <h2>{lang === "bn" ? "গ্রাহকভিত্তিক সারাংশ" : "Customer summary"}</h2>
              <div className="mt-2 divide-y divide-stone-100 dark:divide-stone-800">
                {Object.entries(byCustomer)
                  .sort((a, b) => b[1].give + b[1].take - (a[1].give + a[1].take))
                  .slice(0, 10)
                  .map(([id, o]) => {
                    const c = state.customers.find((x) => x.id === id);
                    return (
                      <div key={id} className="flex items-center justify-between gap-2 py-2">
                        <span className="min-w-0 truncate text-sm font-semibold">{c?.name ?? "—"}</span>
                        <span className="flex items-center gap-3 text-xs">
                          <span className="text-stone-400">{o.count}×</span>
                          <span className="num font-bold text-emerald-600 dark:text-emerald-400">{money(o.take, state)}</span>
                          <span className="num font-bold text-stone-600 dark:text-stone-300">{money(o.give, state)}</span>
                        </span>
                      </div>
                    );
                  })}
                {Object.keys(byCustomer).length === 0 && <p className="py-6 text-center text-sm text-stone-400">{t(lang, "noData")}</p>}
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-stone-100 px-5 py-3 dark:border-stone-800">
              <h2 className="font-bold">{lang === "bn" ? "সময়কালের লেনদেন" : "Transactions in period"}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400 dark:border-stone-800">
                    <th className="px-5 py-2.5 font-semibold">{t(lang, "date")}</th>
                    <th className="px-3 py-2.5 font-semibold">{t(lang, "customer")}</th>
                    <th className="px-3 py-2.5 font-semibold">{t(lang, "typeLabel")}</th>
                    <th className="px-3 py-2.5 font-semibold">{t(lang, "note")}</th>
                    <th className="px-5 py-2.5 text-right font-semibold">{t(lang, "amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {periodTxns.slice().sort((a, b) => b.date.localeCompare(a.date)).map((x) => {
                    const c = state.customers.find((k) => k.id === x.customerId);
                    const give = x.type === "sale" || x.type === "payment_out";
                    return (
                      <tr key={x.id} className="border-b border-stone-50 dark:border-stone-800/60">
                        <td className="whitespace-nowrap px-5 py-2 text-stone-500">{x.date}</td>
                        <td className="px-3 py-2 font-semibold">{c?.name ?? "—"}</td>
                        <td className="px-3 py-2">{lang === "bn" ? TXN_META[x.type].bn : TXN_META[x.type].en}</td>
                        <td className="max-w-[160px] truncate px-3 py-2 text-xs text-stone-400">{x.note || "—"}</td>
                        <td className={`num px-5 py-2 text-right font-bold ${give ? "" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {money((give ? 1 : -1) * x.amount, state)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {mode === "monthly" && (
        <Card className="overflow-hidden">
          <div className="border-b border-stone-100 px-5 py-3 dark:border-stone-800">
            <h2 className="font-bold">{lang === "bn" ? "মাসভিত্তিক সারাংশ" : "Monthly summary"}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400 dark:border-stone-800">
                  <th className="px-5 py-2.5 font-semibold">{t(lang, "month")}</th>
                  <th className="px-3 py-2.5 text-right font-semibold">{lang === "bn" ? "বিক্রি" : "Sales"}</th>
                  <th className="px-3 py-2.5 text-right font-semibold">{t(lang, "totalReceived")}</th>
                  <th className="px-5 py-2.5 text-right font-semibold">{t(lang, "netBalance")}</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.key} className="border-b border-stone-50 dark:border-stone-800/60">
                    <td className="px-5 py-2.5 font-semibold">{monthLabel(m.key, lang)}</td>
                    <td className="num px-3 py-2.5 text-right">{money(m.sale, state)}</td>
                    <td className="num px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400">{money(m.received, state)}</td>
                    <td className="num px-5 py-2.5 text-right font-bold">{moneySigned(m.sale - m.received, state)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {mode === "dues" && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="flex items-center gap-2 font-bold">
                {t(lang, "dueCustomers")}{" "}
                <Badge tone="rose">
                  {money(
                    dueList.filter((x) => x.bal > 0).reduce((s, x) => s + x.bal, 0),
                    state,
                  )}
                </Badge>
              </h2>
              <div className="mt-2 divide-y divide-stone-100 dark:divide-stone-800">
                {dueList
                  .filter((x) => x.bal > 0)
                  .map(({ c, bal }) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 py-2.5">
                      <span className="min-w-0 truncate text-sm font-semibold">{c.name}</span>
                      <span className="num shrink-0 text-sm font-bold text-rose-600 dark:text-rose-400">{money(bal, state)}</span>
                    </div>
                  ))}
                {dueList.filter((x) => x.bal > 0).length === 0 && (
                  <p className="py-6 text-center text-sm text-emerald-500">{t(lang, "settled")} ✓</p>
                )}
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-bold">{lang === "bn" ? "আপনার দেনা (সাপ্লায়ার)" : "Your payables (suppliers)"}</h2>
              <div className="mt-2 divide-y divide-stone-100 dark:divide-stone-800">
                {dueList
                  .filter((x) => x.bal < 0)
                  .map(({ c, bal }) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 py-2.5">
                      <span className="min-w-0 truncate text-sm font-semibold">{c.name}</span>
                      <span className="num shrink-0 text-sm font-bold text-amber-600 dark:text-amber-400">{money(-bal, state)}</span>
                    </div>
                  ))}
                {dueList.filter((x) => x.bal < 0).length === 0 && (
                  <p className="py-6 text-center text-sm text-emerald-500">{t(lang, "settled")} ✓</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function SmallStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    green: "text-emerald-600 dark:text-emerald-400",
    sky: "text-sky-600 dark:text-sky-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-500 dark:text-rose-400",
    brand: "text-[var(--brand)]",
  };
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-stone-400">{label}</p>
      <p className={`num mt-1 text-lg font-bold ${tones[tone]}`}>{value}</p>
    </Card>
  );
}
