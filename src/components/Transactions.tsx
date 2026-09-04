import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useStore } from "../lib/store-context";
import { computeBalances } from "../lib/calc";
import { fmtDateShort, money, moneySigned, t } from "../lib/format";
import { TXN_META } from "../lib/i18n";
import type { Txn, TxnType } from "../types";
import { Badge, Button, Card, EmptyState } from "./ui";
import { AddTxnModal } from "./Modals";
import { exportTransactionsCSV } from "../lib/csv";

type Filter = "all" | TxnType;

export default function Transactions({ onAddTxn }: { onAddTxn: () => void }) {
  const { state } = useStore();
  const lang = state.settings.language;
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState<Filter>("all");
  const [custF, setCustF] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editing, setEditing] = useState<Txn | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const balances = useMemo(() => computeBalances(state.txns), [state.txns]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.txns
      .filter((tx) => (typeF === "all" ? true : tx.type === typeF))
      .filter((tx) => (custF === "all" ? true : tx.customerId === custF))
      .filter((tx) => (from ? tx.date >= from : true))
      .filter((tx) => (to ? tx.date <= to : true))
      .filter((tx) => {
        if (!needle) return true;
        const c = state.customers.find((x) => x.id === tx.customerId);
        return (
          (c?.name ?? "").toLowerCase().includes(needle) ||
          (c?.phone ?? "").toLowerCase().includes(needle) ||
          (tx.note ?? "").toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [state.txns, state.customers, typeF, custF, from, to, q]);

  const totals = useMemo(() => {
    let give = 0;
    let take = 0;
    for (const tx of rows) {
      if (tx.type === "sale" || tx.type === "payment_out") give += tx.amount;
      else take += tx.amount;
    }
    return { give, take };
  }, [rows]);

  const exportAll = () => exportTransactionsCSV(state);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t(lang, "transactions")}</h1>
          <p className="text-sm text-stone-400">
            {rows.length} {t(lang, "entry")} · {t(lang, "totalGiven")}: {money(totals.give, state)} / {t(lang, "collected")}:{" "}
            {money(totals.take, state)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAll}>
            {t(lang, "exportCsv")}
          </Button>
          <Button onClick={onAddTxn}>
            <Plus size={16} /> {t(lang, "addTxn")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="relative col-span-2 sm:col-span-1 lg:col-span-2">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(lang, "search")}
            className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>
        <select
          value={typeF}
          onChange={(e) => setTypeF(e.target.value as Filter)}
          className="rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-[var(--brand)] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        >
          <option value="all">{t(lang, "all")}</option>
          {(Object.keys(TXN_META) as TxnType[]).map((k) => (
            <option key={k} value={k}>
              {lang === "bn" ? TXN_META[k].bn : TXN_META[k].en}
            </option>
          ))}
        </select>
        <select
          value={custF}
          onChange={(e) => setCustF(e.target.value)}
          className="rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-[var(--brand)] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        >
          <option value="all">{t(lang, "all")}</option>
          {state.customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-[var(--brand)] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-[var(--brand)] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100" />
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Search size={26} />}
          title={t(lang, "noResult")}
          hint={t(lang, "noData")}
          action={<Button onClick={onAddTxn}><Plus size={15} />{t(lang, "addTxn")}</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400 dark:border-stone-800">
                  <th className="px-4 py-3 font-semibold">{t(lang, "date")}</th>
                  <th className="px-3 py-3 font-semibold">{t(lang, "customer")}</th>
                  <th className="px-3 py-3 font-semibold">{t(lang, "typeLabel")}</th>
                  <th className="px-3 py-3 font-semibold">{t(lang, "note")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t(lang, "amount")}</th>
                  <th className="px-3 py-3 text-right font-semibold">{t(lang, "actions")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    balances={balances}
                    onEdit={() => {
                      setEditing(tx);
                      setEditOpen(true);
                    }}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-200 font-bold dark:border-stone-700">
                  <td colSpan={4} className="px-4 py-3">
                    {t(lang, "settlement")}
                  </td>
                  <td className="num px-4 py-3 text-right">{moneySigned(totals.give - totals.take, state)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      <AddTxnModal open={editOpen} onClose={() => setEditOpen(false)} editing={editing} />
    </div>
  );
}

function TransactionRow({
  tx,
  balances,
  onEdit,
}: {
  tx: Txn;
  balances: Record<string, number>;
  onEdit: () => void;
}) {
  const { state, deleteTxn } = useStore();
  const lang = state.settings.language;
  const [confirmDel, setConfirmDel] = useState(false);
  const c = state.customers.find((x) => x.id === tx.customerId);
  const give = tx.type === "sale" || tx.type === "payment_out";
  const meta = TXN_META[tx.type];
  const bal = balances[tx.customerId] || 0;
  return (
    <tr className="border-b border-stone-50 align-top dark:border-stone-800/60">
      <td className="whitespace-nowrap px-4 py-2.5 text-stone-500">{fmtDateShort(tx.date, lang, state.settings.language === "bn" && state.settings.bengaliDigits)}</td>
      <td className="px-3 py-2.5">
        <p className="font-semibold">{c?.name ?? "—"}</p>
        <p className="text-[11px] text-stone-400">{c?.phone || ""}</p>
      </td>
      <td className="px-3 py-2.5">
        <Badge tone={give ? "brand" : "green"}>
          {give ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
          {lang === "bn" ? meta.shortBn : meta.shortEn}
        </Badge>
      </td>
      <td className="max-w-[160px] truncate px-3 py-2.5 text-xs text-stone-400">{tx.note || "—"}</td>
      <td className="px-4 py-2.5 text-right">
        <p className={`num font-bold ${give ? "text-stone-700 dark:text-stone-200" : "text-emerald-600 dark:text-emerald-400"}`}>
          {money((give ? 1 : -1) * tx.amount, state)}
        </p>
        <p className={`num text-[11px] ${bal > 0 ? "text-rose-500" : bal < 0 ? "text-amber-500" : "text-emerald-500"}`}>
          {moneySigned(bal, state)}
        </p>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={onEdit}
            className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-[var(--brand)] dark:hover:bg-stone-800"
            aria-label={t(lang, "editTxn")}
          >
            <Pencil size={14} />
          </button>
          {confirmDel ? (
            <button
              onClick={() => deleteTxn(tx.id)}
              onMouseLeave={() => setConfirmDel(false)}
              className="grid h-8 place-items-center rounded-lg bg-rose-600 px-2 text-[11px] font-bold text-white"
            >
              {t(lang, "delete")}?
            </button>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
              aria-label={t(lang, "deleteTxn")}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
