import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { useStore } from "../lib/store-context";
import { balanceOf, sortKeyDate } from "../lib/calc";
import { fmtDate, money, moneySigned, t, toBengaliDigits } from "../lib/format";
import { TXN_META } from "../lib/i18n";
import { Badge, Button, Card, EmptyState } from "./ui";
import { CustomerFormModal } from "./Modals";
import { downloadCSV } from "../lib/csv";

export default function CustomerLedger({
  customerId,
  onBack,
  onAddTxn,
}: {
  customerId: string;
  onBack: () => void;
  onAddTxn: () => void;
}) {
  const { state, deleteCustomer } = useStore();
  const lang = state.settings.language;
  const digits = state.settings.language === "bn" && state.settings.bengaliDigits;
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const customer = state.customers.find((c) => c.id === customerId);
  const txns = useMemo(
    () => state.txns.filter((x) => x.customerId === customerId).sort(sortKeyDate),
    [state.txns, customerId],
  );

  if (!customer) {
    return (
      <EmptyState
        icon={<BookOpenText size={26} />}
        title={t(lang, "noResult")}
        action={<Button onClick={onBack}>{t(lang, "back")}</Button>}
      />
    );
  }

  const balance = balanceOf(state.txns, customerId);
  const totalGive = txns.filter((x) => x.type === "sale" || x.type === "payment_out").reduce((s, x) => s + x.amount, 0);
  const totalTake = txns.filter((x) => x.type === "purchase" || x.type === "payment_in").reduce((s, x) => s + x.amount, 0);

  const exportCSV = () => {
    const header =
      lang === "bn"
        ? ["তারিখ", "বিবরণ", "দেনা (টাকা)", "পাওনা (টাকা)", "ব্যালেন্স"]
        : ["Date", "Description", "Credit (Taka)", "Debit (Taka)", "Balance"];
    let run = 0;
    const rows = txns.map((x) => {
      const give = x.type === "sale" || x.type === "payment_out";
      run += give ? x.amount : -x.amount;
      return [
        x.date,
        lang === "bn" ? TXN_META[x.type].bn : TXN_META[x.type].en + (x.note ? ` - ${x.note}` : ""),
        give ? x.amount : "",
        give ? "" : x.amount,
        run,
      ];
    });
    downloadCSV(`${customer.name}-khata.csv`, [header, ...rows]);
  };

  // running balance rows
  let running = 0;
  const rows = txns.map((x) => {
    const give = x.type === "sale" || x.type === "payment_out";
    running += give ? x.amount : -x.amount;
    return { x, give, running };
  });

  return (
    <div className="space-y-4">
      <div className="no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-[var(--brand)]"
        >
          <ArrowLeft size={16} /> {t(lang, "back")}
        </button>
      </div>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {customer.name}
            {customer.type === "supplier" && <Badge tone="sky">{t(lang, "supplierType")}</Badge>}
          </h1>
          <p className="text-sm text-stone-400">
            {customer.phone && (
              <a className="hover:text-[var(--brand)]" href={`tel:${customer.phone}`}>
                {customer.phone}
              </a>
            )}
            {customer.phone && customer.address ? " · " : ""}
            {customer.address}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil size={15} /> {t(lang, "editCustomer")}
          </Button>
          <Button onClick={onAddTxn}>
            <Plus size={16} /> {t(lang, "addTxn")}
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="no-print grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryBox
          label={balance > 0 ? t(lang, "youWillGet") : balance < 0 ? t(lang, "youOwe") : t(lang, "settled")}
          value={money(Math.abs(balance), state)}
          tone={balance > 0 ? "rose" : balance < 0 ? "amber" : "green"}
          big
        />
        <SummaryBox label={t(lang, "totalGiven")} value={money(totalGive, state)} tone="brand" />
        <SummaryBox label={t(lang, "totalReceived")} value={money(totalTake, state)} tone="sky" />
        <SummaryBox label={t(lang, "txnCount")} value={String(txns.length)} tone="neutral" />
      </div>

      <Card className="no-print flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="flex flex-wrap gap-2">
          {customer.phone && (
            <>
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200"
              >
                <Phone size={15} /> {t(lang, "call")}
              </a>
              <a
                href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </>
          )}
          <Button variant="outline" onClick={exportCSV}>
            {t(lang, "exportCsv")}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={15} /> {t(lang, "printStatement")}
          </Button>
        </div>
        <Button
          variant="ghost"
          className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={15} /> {t(lang, "deleteCustomer")}
        </Button>
      </Card>

      {/* Printable statement */}
      <div className="print-area">
        <Card className="overflow-hidden">
          <div className="border-b border-stone-200 bg-[var(--brand)] px-5 py-4 text-white print:bg-white print:text-black">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold leading-tight">{state.settings.shopName}</p>
                <p className="text-xs opacity-80">
                  {state.settings.address}
                  {state.settings.phone ? ` · ${state.settings.phone}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{t(lang, "statement")}</p>
                <p className="text-xs opacity-80">{fmtDate(new Date().toISOString().slice(0, 10), lang, digits)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-5 py-3 dark:border-stone-800">
            <p className="font-semibold">
              {t(lang, "ledgerOf")}: {customer.name} {customer.phone ? `(${customer.phone})` : ""}
            </p>
            <Badge tone={balance > 0 ? "rose" : balance < 0 ? "amber" : "green"}>
              {t(lang, "balance")}: {moneySigned(balance, state)}
            </Badge>
          </div>

          {txns.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-stone-400">{t(lang, "noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-400 dark:border-stone-800">
                    <th className="px-5 py-2.5 font-semibold">{t(lang, "date")}</th>
                    <th className="px-3 py-2.5 font-semibold">{t(lang, "typeLabel")}</th>
                    <th className="px-3 py-2.5 font-semibold">{t(lang, "note")}</th>
                    <th className="px-3 py-2.5 text-right font-semibold">{t(lang, "youWillGet")}</th>
                    <th className="px-3 py-2.5 text-right font-semibold">{t(lang, "youOwe")}</th>
                    <th className="px-5 py-2.5 text-right font-semibold">{t(lang, "balance")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ x, give, running }) => (
                    <tr key={x.id} className="border-b border-stone-50 align-top dark:border-stone-800/60">
                      <td className="num whitespace-nowrap px-5 py-2.5 text-stone-500">
                        {digits ? toBengaliDigits(x.date) : x.date}
                      </td>
                      <td className="px-3 py-2.5 font-medium">
                        {lang === "bn" ? TXN_META[x.type].bn : TXN_META[x.type].en}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-2.5 text-xs text-stone-400">{x.note || "—"}</td>
                      <td className="num px-3 py-2.5 text-right">{give ? money(x.amount, state) : ""}</td>
                      <td className="num px-3 py-2.5 text-right">{!give ? money(x.amount, state) : ""}</td>
                      <td
                        className={`num whitespace-nowrap px-5 py-2.5 text-right font-semibold ${
                          running > 0
                            ? "text-rose-600 dark:text-rose-400"
                            : running < 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {moneySigned(running, state)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-stone-200 font-bold dark:border-stone-700">
                    <td colSpan={3} className="px-5 py-3">
                      {t(lang, "settlement")}
                    </td>
                    <td className="num px-3 py-3 text-right">{money(totalGive, state)}</td>
                    <td className="num px-3 py-3 text-right">{money(totalTake, state)}</td>
                    <td
                      className={`num px-5 py-3 text-right ${
                        balance > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : balance < 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {moneySigned(balance, state)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="flex items-end justify-between px-5 py-6 print:mt-8">
            <div>
              <p className="text-sm font-bold">{t(lang, "shopFooter")}</p>
              <p className="text-xs text-stone-400">
                {lang === "bn" ? "এটি কম্পিউটার তৈরি তালি খাতা" : "Computer generated Tali Khata"}
              </p>
            </div>
            <div className="text-center">
              <p className="mb-10 text-sm">{t(lang, "signature")}</p>
              <p className="border-t border-stone-400 px-6 pt-1 text-xs text-stone-400">
                {state.settings.ownerName || state.settings.shopName}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <CustomerFormModal open={editOpen} onClose={() => setEditOpen(false)} editing={customer} />
      {confirmDelete && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <Card className="max-w-sm p-6">
            <p className="font-bold">{t(lang, "deleteCustomer")}?</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t(lang, "confirmDeleteCustomer")}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                {t(lang, "cancel")}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteCustomer(customerId);
                  onBack();
                }}
              >
                <Trash2 size={14} /> {t(lang, "delete")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryBox({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone: "brand" | "rose" | "amber" | "green" | "sky" | "neutral";
  big?: boolean;
}) {
  const tones: Record<string, string> = {
    brand: "text-[var(--brand)]",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-emerald-600 dark:text-emerald-400",
    sky: "text-sky-600 dark:text-sky-400",
    neutral: "text-stone-700 dark:text-stone-200",
  };
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-stone-400">{label}</p>
      <p className={`num mt-1 font-bold ${big ? "text-xl" : "text-lg"} ${tones[tone]}`}>{value}</p>
    </Card>
  );
}
