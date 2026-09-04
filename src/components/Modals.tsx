import { useEffect, useMemo, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useStore } from "../lib/store-context";
import { t } from "../lib/format";
import { TXN_META } from "../lib/i18n";
import { todayISO, toNumber } from "../lib/calc";
import type { Customer, PartyType, Txn, TxnType } from "../types";
import { Button, Input, Modal, Select } from "./ui";

/* ---------------------------------- Customer ---------------------------------- */

export function CustomerFormModal({
  open,
  onClose,
  editing,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Customer | null;
  onDeleted?: () => void;
}) {
  const { state, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const lang = state.settings.language;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<PartyType>("customer");
  const [note, setNote] = useState("");
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setPhone(editing?.phone ?? "");
      setAddress(editing?.address ?? "");
      setType(editing?.type ?? "customer");
      setNote(editing?.note ?? "");
      setError(false);
      setConfirmDelete(false);
    }
  }, [open, editing]);

  const save = () => {
    if (!name.trim()) {
      setError(true);
      return;
    }
    if (editing) updateCustomer(editing.id, { name: name.trim(), phone: phone.trim(), address: address.trim(), type, note: note.trim() });
    else addCustomer({ name: name.trim(), phone: phone.trim(), address: address.trim(), type, note: note.trim() });
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    deleteCustomer(editing.id);
    onDeleted?.();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? t(lang, "editCustomer") : t(lang, "addCustomer")}>
      <div className="space-y-4">
        <Input
          label={`${t(lang, "name")} *`}
          value={name}
          onChange={setName}
          placeholder={lang === "bn" ? "যেমন: রফিকুল ইসলাম" : "e.g. Rofiqul Islam"}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label={t(lang, "phone")} value={phone} onChange={setPhone} placeholder="017XX-XXXXXX" inputMode="tel" />
          <Select label={t(lang, "type")} value={type} onChange={(v) => setType(v as PartyType)}>
            <option value="customer">{t(lang, "customerType")}</option>
            <option value="supplier">{t(lang, "supplierType")}</option>
          </Select>
        </div>
        <Input label={t(lang, "address")} value={address} onChange={setAddress} />
        <Input label={t(lang, "note")} value={note} onChange={setNote} />

        {error && <p className="text-sm font-medium text-rose-600">{t(lang, "required")}</p>}

        <div className="flex items-center justify-between gap-2 pt-1">
          {editing ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <Button variant="danger" onClick={remove} className="text-xs">
                  <Trash2 size={14} /> {t(lang, "delete")}
                </Button>
                <span className="text-xs text-stone-400">{t(lang, "confirmDeleteCustomer")}</span>
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                <Trash2 size={15} /> {t(lang, "deleteCustomer")}
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t(lang, "cancel")}
            </Button>
            <Button onClick={save}>
              <Check size={16} /> {t(lang, "save")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------------------------- Transaction ---------------------------------- */

export function AddTxnModal({
  open,
  onClose,
  presetCustomerId,
  editing,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  presetCustomerId?: string | null;
  editing?: Txn | null;
  onDeleted?: () => void;
}) {
  const { state, addTxn, updateTxn, deleteTxn } = useStore();
  const lang = state.settings.language;
  const customers = state.customers;

  const [customerId, setCustomerId] = useState("");
  const [type, setType] = useState<TxnType>("sale");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState<"" | "required" | "amount">("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setCustomerId(editing.customerId);
        setType(editing.type);
        setAmount(String(editing.amount));
        setDate(editing.date);
        setNote(editing.note ?? "");
      } else {
        setCustomerId(presetCustomerId ?? customers[0]?.id ?? "");
        setType("sale");
        setAmount("");
        setDate(todayISO());
        setNote("");
      }
      setError("");
      setConfirmDelete(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetCustomerId, editing]);

  const save = () => {
    if (!customerId) {
      setError("required");
      return;
    }
    const amt = toNumber(amount);
    if (!amt || amt <= 0) {
      setError("amount");
      return;
    }
    if (editing) {
      updateTxn(editing.id, { customerId, type, amount: amt, date: date || todayISO(), note: note.trim() });
    } else {
      addTxn({ customerId, type, amount: amt, date: date || todayISO(), note: note.trim() });
    }
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    deleteTxn(editing.id);
    onDeleted?.();
    onClose();
  };

  const typeOptions = (Object.keys(TXN_META) as TxnType[]).map((k) => ({
    key: k,
    label: lang === "bn" ? TXN_META[k].bn : TXN_META[k].en,
    desc: lang === "bn" ? (k === "sale" ? "পণ্য দিয়ে বাকি করলেন" : k === "payment_in" ? "টাকা আদায় পেলেন" : k === "purchase" ? "মাল উঠিয়ে পাওনা হল" : "সাপ্লায়ারকে টাকা দিলেন") : "",
  }));

  const selectedCust = useMemo(() => customers.find((c) => c.id === customerId), [customers, customerId]);
  const typeDesc = typeOptions.find((o) => o.key === type)?.desc ?? "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t(lang, "editTxn") : t(lang, "addTxn")}
    >
      {customers.length === 0 ? (
        <div className="py-6 text-center text-sm text-stone-500">
          {t(lang, "noCustomersHint")}
        </div>
      ) : (
        <div className="space-y-4">
          <Select label={t(lang, "customer")} value={customerId} onChange={setCustomerId}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </Select>

          <div>
            <span className="mb-1 block text-[13px] font-semibold text-stone-600 dark:text-stone-300">
              {t(lang, "typeLabel")}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setType(o.key)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                    type === o.key
                      ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)] ring-2 ring-[var(--brand)]/20"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:text-stone-300"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {typeDesc && <p className="mt-1.5 text-xs text-stone-400">{typeDesc}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`${t(lang, "amount")} *`}
              value={amount}
              onChange={setAmount}
              type="text"
              placeholder="0"
              inputMode="decimal"
            />
            <Input label={t(lang, "date")} value={date} onChange={setDate} type="date" />
          </div>

          <Input label={t(lang, "note")} value={note} onChange={setNote} placeholder={t(lang, "transactionsNote")} />

          {selectedCust && (
            <p className="rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              {selectedCust.name} · {lang === "bn" ? (selectedCust.type === "customer" ? "গ্রাহক" : "সাপ্লায়ার") : selectedCust.type === "customer" ? "Customer" : "Supplier"}
            </p>
          )}

          {error && (
            <p className="text-sm font-medium text-rose-600">
              {error === "required" ? t(lang, "required") : t(lang, "amountInvalid")}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {editing ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <Button variant="danger" onClick={remove} className="text-xs">
                    <Trash2 size={14} /> {t(lang, "delete")}
                  </Button>
                  <span className="text-xs text-stone-400">{t(lang, "confirmDeleteTxn")}</span>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmDelete(true)} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <Trash2 size={15} /> {t(lang, "deleteTxn")}
                </Button>
              )
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                {t(lang, "cancel")}
              </Button>
              <Button onClick={save}>
                <Check size={16} /> {t(lang, "save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
