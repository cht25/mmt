import { useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  HandCoins,
  Plus,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useStore } from "../lib/store-context";
import { computeBalances, sumFor, todayISO, monthKey, totalOf } from "../lib/calc";
import { amountStr, fmtDateShort, money, t, weekdayLabel } from "../lib/format";
import { TXN_META } from "../lib/i18n";
import { Badge, Button, Card, EmptyState, StatCard } from "./ui";
import { Chart7 } from "./Chart";
import type { Txn } from "../types";

export default function Dashboard({
  onOpenCustomer,
  onAddTxn,
  onAddCustomer,
}: {
  onOpenCustomer: (id: string) => void;
  onAddTxn: () => void;
  onAddCustomer: () => void;
}) {
  const { state } = useStore();
  const lang = state.settings.language;
  const digits = state.settings.language === "bn" && state.settings.bengaliDigits;
  const today = todayISO();
  const month = monthKey(today);

  const balances = useMemo(() => computeBalances(state.txns), [state.txns]);
  const receivable = state.customers.reduce((s, c) => s + Math.max(0, balances[c.id] || 0), 0);
  const payable = state.customers.reduce((s, c) => s + Math.max(0, -(balances[c.id] || 0)), 0);
  const net = receivable - payable;

  // Stats
  const todaysSale = totalOf(state.txns, "sale", today);
  const todaysIn = totalOf(state.txns, "payment_in", today);
  const monthSale = sumFor(state.txns, (tx) => tx.type === "sale" && monthKey(tx.date) === month);
  const monthIn = sumFor(state.txns, (tx) => tx.type === "payment_in" && monthKey(tx.date) === month);

  const topDues = state.customers
    .filter((c) => (balances[c.id] || 0) > 0)
    .sort((a, b) => (balances[b.id] || 0) - (balances[a.id] || 0))
    .slice(0, 5);

  const topPayers = state.customers
    .map((c) => ({
      c,
      total: sumFor(state.txns, (tx) => tx.customerId === c.id && tx.type === "payment_in"),
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const recent = state.txns.slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 8);

  if (state.customers.length === 0) {
    return (
      <div className="space-y-5">
        <DashboardHeader onAddTxn={onAddTxn} onAddCustomer={onAddCustomer} />
        <EmptyState
          icon={<Users size={26} />}
          title={t(lang, "noCustomersYet")}
          hint={t(lang, "useHint")}
          action={
            <Button onClick={onAddCustomer}>
              <UserPlus size={16} /> {t(lang, "addCustomer")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DashboardHeader onAddTxn={onAddTxn} onAddCustomer={onAddCustomer} />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={<HandCoins size={19} />}
          label={t(lang, "totalReceivable")}
          value={money(receivable, state)}
          tone="green"
        />
        <StatCard
          icon={<ArrowUpRight size={19} />}
          label={t(lang, "totalPayable")}
          value={money(payable, state)}
          tone="rose"
        />
        <StatCard
          icon={<TrendingUp size={19} />}
          label={t(lang, "netBalance")}
          value={money(net, state)}
          tone={net >= 0 ? "brand" : "amber"}
        />
        <StatCard
          icon={<ShoppingBag size={19} />}
          label={t(lang, "todaySale")}
          value={money(todaysSale, state)}
          sub={`${t(lang, "todayCollection")}: ${money(todaysIn, state)}`}
          tone="sky"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">{t(lang, "last7days")}</h2>
              <p className="text-xs text-stone-400">
                {t(lang, "today")}: {amountStr(todaysSale, lang, digits)} ৳ · {t(lang, "monthSale")}:{" "}
                {amountStr(monthSale, lang, digits)} ৳
              </p>
            </div>
            <Badge tone="brand">
              {amountStr(monthSale - monthIn, lang, digits)} ৳
            </Badge>
          </div>
          {state.txns.length ? (
            <Chart7 txns={state.txns} labels={lang === "bn" ? ["বিক্রি", "আদায়"] : ["Sales", "Collected"]} />
          ) : (
            <p className="py-10 text-center text-sm text-stone-400">{t(lang, "noData")}</p>
          )}
        </Card>

        {/* Top dues */}
        <Card className="p-5">
          <h2 className="font-bold">{t(lang, "topDues")}</h2>
          <div className="mt-3 space-y-1">
            {topDues.length === 0 && <p className="py-6 text-center text-sm text-stone-400">{t(lang, "settled")} ✓</p>}
            {topDues.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenCustomer(c.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{c.name}</span>
                  <span className="text-[11px] text-stone-400">{c.phone || c.address || "—"}</span>
                </span>
                <span className="num shrink-0 text-sm font-bold text-rose-600 dark:text-rose-400">
                  {money(balances[c.id] || 0, state)}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{t(lang, "recentActivity")}</h2>
            <span className="text-xs text-stone-400">
              {state.customers.length} {t(lang, "customerCount")}
            </span>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {recent.map((tx) => (
              <RecentRow key={tx.id} tx={tx} />
            ))}
            {recent.length === 0 && <p className="py-8 text-center text-sm text-stone-400">{t(lang, "noData")}</p>}
          </div>
        </Card>

        {/* Best payers */}
        <Card className="p-5">
          <h2 className="font-bold">{t(lang, "bestPayers")}</h2>
          <div className="mt-3 space-y-1">
            {topPayers.length === 0 && <p className="py-6 text-center text-sm text-stone-400">{t(lang, "noData")}</p>}
            {topPayers.map(({ c, total }, i) => (
              <button
                key={c.id}
                onClick={() => onOpenCustomer(c.id)}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.name}</span>
                <span className="num shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {money(total, state)}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DashboardHeader({ onAddTxn, onAddCustomer }: { onAddTxn: () => void; onAddCustomer: () => void }) {
  const { state } = useStore();
  const lang = state.settings.language;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
          {t(lang, "dashboard")} 👋
        </h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-400">
          <CalendarDays size={14} />
          {fmtDateShort(todayISO(), lang, state.settings.language === "bn" && state.settings.bengaliDigits)} ·{" "}
          {weekdayLabel(todayISO(), lang)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onAddCustomer}>
          <UserPlus size={16} /> <span className="hidden sm:inline">{t(lang, "addCustomer")}</span>
        </Button>
        <Button onClick={onAddTxn}>
          <Plus size={16} /> {t(lang, "addTxn")}
        </Button>
      </div>
    </div>
  );
}

function RecentRow({ tx }: { tx: Txn }) {
  const { state } = useStore();
  const lang = state.settings.language;
  const cust = state.customers.find((c) => c.id === tx.customerId);
  const meta = TXN_META[tx.type];
  const inflow = tx.type === "sale" || tx.type === "payment_out";
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          inflow ? "bg-[var(--brand)]/10 text-[var(--brand)]" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
        }`}
      >
        {inflow ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{cust?.name ?? "—"}</p>
        <p className="truncate text-xs text-stone-400">
          {lang === "bn" ? meta.shortBn : meta.shortEn}
          {tx.note ? ` · ${tx.note}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className={`num text-sm font-bold ${inflow ? "text-stone-700 dark:text-stone-200" : "text-emerald-600 dark:text-emerald-400"}`}>
          {money((inflow ? 1 : -1) * tx.amount, state)}
        </p>
        <p className="text-[11px] text-stone-400">{fmtDateShort(tx.date, lang, state.settings.language === "bn" && state.settings.bengaliDigits)}</p>
      </div>
    </div>
  );
}
