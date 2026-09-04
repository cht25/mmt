import { useMemo, useState } from "react";
import { BookOpenText, MessageCircle, Pencil, Phone, Plus, Search, Users } from "lucide-react";
import { useStore } from "../lib/store-context";
import { computeBalances } from "../lib/calc";
import { money, t } from "../lib/format";
import { Avatar, Badge, Button, Card, EmptyState } from "./ui";
import { CustomerFormModal } from "./Modals";
import { exportCustomersCSV } from "../lib/csv";

export default function Customers({
  onOpenCustomer,
  onAdd,
}: {
  onOpenCustomer: (id: string) => void;
  onAdd: () => void;
}) {
  const { state } = useStore();
  const lang = state.settings.language;
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "customer" | "supplier">("all");
  const [editing, setEditing] = useState<import("../types").Customer | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const balances = useMemo(() => computeBalances(state.txns), [state.txns]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.customers
      .filter((c) => (tab === "all" ? true : c.type === tab))
      .filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.phone.toLowerCase().includes(needle))
      .sort((a, b) => {
        const ba = balances[a.id] || 0;
        const bb = balances[b.id] || 0;
        if (Math.abs(bb - ba) > 0.001) return bb - ba;
        return a.name.localeCompare(b.name);
      });
  }, [state.customers, balances, q, tab]);

  const counts = useMemo(() => {
    const c = state.customers.filter((x) => x.type === "customer").length;
    return { all: state.customers.length, customer: c, supplier: state.customers.length - c };
  }, [state.customers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t(lang, "customers")}</h1>
          <p className="text-sm text-stone-400">
            {counts.all} {t(lang, "khatas")} · {counts.customer} {t(lang, "customerType")} · {counts.supplier} {t(lang, "supplierType")}
          </p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={16} /> {t(lang, "addCustomer")}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(lang, "search")}
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-[15px] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>
        <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          {(["all", "customer", "supplier"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
                tab === k ? "bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-500"
              }`}
            >
              {t(lang, k === "all" ? "all" : k === "customer" ? "customerType" : "supplierType")}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={() => exportCustomersCSV(state, balances)}>
          {t(lang, "exportCsv")}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={q || tab !== "all" ? <Search size={26} /> : <Users size={26} />}
          title={q || tab !== "all" ? t(lang, "noResult") : t(lang, "noCustomersYet")}
          hint={q || tab !== "all" ? undefined : t(lang, "noCustomersHint")}
          action={!q && tab === "all" ? <Button onClick={onAdd}><Plus size={16} />{t(lang, "addCustomer")}</Button> : undefined}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const bal = balances[c.id] || 0;
            const dir = bal > 0 ? "get" : bal < 0 ? "owe" : "settled";
            return (
              <Card key={c.id} className="p-4" onClick={() => onOpenCustomer(c.id)}>
                <div className="flex items-start gap-3">
                  <Avatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{c.name}</p>
                    <p className="truncate text-xs text-stone-400">
                      {c.phone || c.address || (lang === "bn" ? "নতুন খাতা" : "New khata")}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge tone={dir === "get" ? "rose" : dir === "owe" ? "amber" : "green"}>
                        {dir === "get" ? t(lang, "youWillGet") : dir === "owe" ? t(lang, "youOwe") : t(lang, "settled")}
                      </Badge>
                      {c.type === "supplier" && <Badge tone="sky">S</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`num text-[15px] font-bold ${dir === "get" ? "text-rose-600 dark:text-rose-400" : dir === "owe" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {money(bal, state)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(c);
                        setEditOpen(true);
                      }}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-[var(--brand)]"
                    >
                      <Pencil size={12} /> {t(lang, "editCustomer")}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
                  {c.phone && (
                    <>
                      <a
                        href={`tel:${c.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                      >
                        <Phone size={13} /> {t(lang, "call")}
                      </a>
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCustomer(c.id);
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[var(--brand)]"
                  >
                    <BookOpenText size={14} /> {t(lang, "viewLedger")}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CustomerFormModal open={editOpen} onClose={() => setEditOpen(false)} editing={editing} />
    </div>
  );
}
