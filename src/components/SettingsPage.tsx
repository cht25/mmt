import { useEffect, useRef, useState } from "react";
import {
  Database,
  Download,
  FileJson,
  Landmark,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Settings2,
  Smartphone,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { useStore } from "../lib/store-context";
import { t } from "../lib/format";
import type { Gateway, GatewayType } from "../types";
import { Badge, Button, Card, Input, Modal, Select, Toggle } from "./ui";

const COLORS = [
  { name: "Green", value: "#0c6b4e" },
  { name: "Teal", value: "#0f766e" },
  { name: "Blue", value: "#1d4ed8" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Rose", value: "#be123c" },
  { name: "Orange", value: "#c2410c" },
  { name: "bKash", value: "#d12053" },
  { name: "Nagad", value: "#f6921e" },
  { name: "Rocket", value: "#8c3494" },
  { name: "Bank", value: "#16a34a" },
];

export default function SettingsPage() {
  const { state, updateSettings, importState, resetAll, loadDemo, addGateway, updateGateway, deleteGateway } = useStore();
  const lang = state.settings.language;
  const [shopName, setShopName] = useState(state.settings.shopName);
  const [ownerName, setOwnerName] = useState(state.settings.ownerName);
  const [phone, setPhone] = useState(state.settings.phone);
  const [address, setAddress] = useState(state.settings.address);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [gwOpen, setGwOpen] = useState(false);
  const [gwEditing, setGwEditing] = useState<Gateway | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const gateways = state.settings.gateways ?? [];

  const saveProfile = () => {
    updateSettings({
      shopName: shopName.trim() || "Mahi And Muhi Traders",
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const onRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.settings || !Array.isArray(parsed.customers) || !Array.isArray(parsed.txns)) {
          alert(lang === "bn" ? "ভুল ফাইল। ব্যাকআপ JSON ফাইল নির্বাচন করুন।" : "Invalid file. Please choose a backup JSON file.");
          return;
        }
        importState(parsed);
        alert(t(lang, "saved"));
      } catch {
        alert(lang === "bn" ? "ফাইলটি পড়া যায়নি।" : "Could not read the file.");
      }
    };
    reader.readAsText(file);
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mmt-talikhata-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const storageKB = Math.max(1, Math.round((new Blob([JSON.stringify(state)]).size / 1024) * 10) / 10);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t(lang, "settings")} · {t(lang, "adminPanel")}</h1>
        <p className="text-sm text-stone-400">{state.settings.shopName}</p>
      </div>

      {/* ================= Admin: payment gateways ================= */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold">
            <Wallet size={17} className="text-[var(--brand)]" /> {t(lang, "paymentGateways")}
          </h2>
          <Button onClick={() => { setGwEditing(null); setGwOpen(true); }}>
            <Plus size={15} /> {t(lang, "addGateway")}
          </Button>
        </div>
        <p className="text-xs text-stone-400">{t(lang, "paymentGatewaysHint")}</p>

        <div className="space-y-2">
          {gateways.map((g) => (
            <div
              key={g.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
                g.enabled ? "border-stone-200 dark:border-stone-700" : "border-dashed border-stone-200 opacity-60 dark:border-stone-700"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: g.color || "#0c6b4e" }}>
                {g.type === "bank" ? <Landmark size={17} /> : g.type === "mobile" ? <Wallet size={17} /> : <Smartphone size={17} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-bold">
                  {g.name}
                  <Badge tone={g.enabled ? "green" : "neutral"}>{g.enabled ? t(lang, "active") : t(lang, "inactive")}</Badge>
                </p>
                <p className="num truncate text-xs text-stone-400">
                  {g.accountNo || "—"} {g.holder ? `· ${g.holder}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Toggle checked={g.enabled} onChange={(v) => updateGateway(g.id, { enabled: v })} />
                <button
                  onClick={() => { setGwEditing(g); setGwOpen(true); }}
                  className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-[var(--brand)] dark:hover:bg-stone-800"
                  aria-label={t(lang, "editGateway")}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => deleteGateway(g.id)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                  aria-label={t(lang, "delete")}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {gateways.length === 0 && (
            <p className="rounded-xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-400 dark:bg-stone-800">
              {t(lang, "noSuppliers")}
            </p>
          )}
        </div>
      </Card>

      {/* ================= Admin: system info ================= */}
      <Card className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <Settings2 size={17} /> {t(lang, "systemInfo")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800">
            <p className="text-xs text-stone-400">{t(lang, "records")}</p>
            <p className="font-bold">
              {state.customers.length} {t(lang, "customer")} · {state.txns.length} {t(lang, "entry")}
            </p>
          </div>
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800">
            <p className="text-xs text-stone-400">{t(lang, "storageUsed")}</p>
            <p className="font-bold">{storageKB} KB</p>
          </div>
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800">
            <p className="text-xs text-stone-400">{t(lang, "pwaStatus")}</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400">{t(lang, "installable")}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
            <p className="text-xs text-amber-600 dark:text-amber-400">{t(lang, "firebaseNote")}</p>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{t(lang, "firebaseHint")}</p>
          </div>
        </div>
      </Card>

      {/* ================= Profile ================= */}
      <Card className="space-y-4 p-5">
        <h2 className="font-bold">{t(lang, "shopProfile")}</h2>
        <Input label={t(lang, "shopName")} value={shopName} onChange={setShopName} />
        <Input label={t(lang, "ownerName")} value={ownerName} onChange={setOwnerName} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t(lang, "phone")} value={phone} onChange={setPhone} placeholder="017XX-XXXXXX" inputMode="tel" />
          <Input label={t(lang, "address")} value={address} onChange={setAddress} />
        </div>
        <div className="flex items-center justify-end gap-2">
          {saved && <Badge tone="green">{t(lang, "saved")}</Badge>}
          <Button onClick={saveProfile}>{t(lang, "save")}</Button>
        </div>
      </Card>

      {/* ================= Appearance ================= */}
      <Card className="space-y-4 p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <Palette size={17} /> {t(lang, "appearance")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Toggle checked={state.settings.language === "bn"} onChange={(v) => updateSettings({ language: v ? "bn" : "en" })} label={t(lang, "language") + " · বাংলা / English"} />
          <Toggle checked={state.settings.bengaliDigits} onChange={(v) => updateSettings({ bengaliDigits: v })} label={t(lang, "bengaliDigits")} />
          <Toggle checked={state.settings.dark} onChange={(v) => updateSettings({ dark: v })} label={t(lang, "darkMode")} />
        </div>
        <div>
          <span className="mb-2 block text-[13px] font-semibold text-stone-600 dark:text-stone-300">{t(lang, "colorTheme")}</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                title={c.name}
                onClick={() => updateSettings({ themeColor: c.value })}
                className={`h-8 w-8 rounded-full transition ${state.settings.themeColor === c.value ? "ring-2 ring-offset-2 ring-[var(--brand)] dark:ring-offset-stone-900" : "hover:scale-110"}`}
                style={{ background: c.value }}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* ================= Backup ================= */}
      <Card className="space-y-4 p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <Database size={17} /> {t(lang, "dataBackup")}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">{t(lang, "exportHint")}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportBackup}>
            <Download size={15} /> {t(lang, "backup")}
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> {t(lang, "restore")}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onRestore(f);
              e.target.value = "";
            }}
          />
        </div>
        <p className="text-xs text-stone-400">{t(lang, "restoreHint")}</p>
      </Card>

      {/* ================= Demo / reset ================= */}
      <Card className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <FileJson size={17} /> {t(lang, "demoData")}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadDemo}>
            <RotateCcw size={15} /> {t(lang, "loadDemo")}
          </Button>
          {confirmClear ? (
            <Button variant="danger" onClick={() => { resetAll(); setConfirmClear(false); }}>
              <Trash2 size={15} /> {t(lang, "confirmClearAll")}
            </Button>
          ) : (
            <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" onClick={() => setConfirmClear(true)}>
              <Trash2 size={15} /> {t(lang, "clearAll")}
            </Button>
          )}
        </div>
      </Card>

      <p className="pb-4 text-center text-xs text-stone-400">
        Mahi And Muhi Traders · {t(lang, "appName")} · v1.1
      </p>

      <GatewayModal open={gwOpen} onClose={() => setGwOpen(false)} editing={gwEditing} onSave={addGateway} onUpdate={updateGateway} />
    </div>
  );
}

function GatewayModal({
  open,
  onClose,
  editing,
  onSave,
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  editing: Gateway | null;
  onSave: (g: Omit<Gateway, "id">) => void;
  onUpdate: (id: string, patch: Partial<Gateway>) => void;
}) {
  const { state } = useStore();
  const lang = state.settings.language;
  const [name, setName] = useState("");
  const [type, setType] = useState<GatewayType>("mobile");
  const [accountNo, setAccountNo] = useState("");
  const [holder, setHolder] = useState("");
  const [instructions, setInstructions] = useState("");
  const [color, setColor] = useState("#d12053");
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setType(editing?.type ?? "mobile");
      setAccountNo(editing?.accountNo ?? "");
      setHolder(editing?.holder ?? "");
      setInstructions(editing?.instructions ?? "");
      setColor(editing?.color ?? "#d12053");
      setEnabled(editing?.enabled ?? true);
      setError("");
    }
  }, [open, editing]);

  const save = () => {
    if (!name.trim()) {
      setError(t(lang, "required"));
      return;
    }
    const data = { name: name.trim(), type, accountNo: accountNo.trim(), holder: holder.trim(), instructions: instructions.trim(), color, enabled };
    if (editing) onUpdate(editing.id, data);
    else onSave(data);
    onClose();
  };

  const typeOptions: { v: GatewayType; label: string }[] = [
    { v: "mobile", label: t(lang, "mobileWallet") },
    { v: "bank", label: t(lang, "bankAccount") },
    { v: "other", label: t(lang, "other") },
  ];

  return (
    <Modal open={open} onClose={onClose} title={editing ? t(lang, "editGateway") : t(lang, "addGateway")} width="max-w-xl">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={`${t(lang, "gatewayName")} *`} value={name} onChange={setName} placeholder="bKash / Nagad / Rocket / ব্যাংক" />
          <Select label={t(lang, "gatewayType")} value={type} onChange={(v) => setType(v as GatewayType)}>
            {typeOptions.map((o) => (
              <option key={o.v} value={o.v}>{o.label}</option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t(lang, "accountNo")} value={accountNo} onChange={setAccountNo} placeholder="017XX-XXXXXX" />
          <Input label={t(lang, "accountHolder")} value={holder} onChange={setHolder} />
        </div>
        <Input label={t(lang, "instructions")} value={instructions} onChange={setInstructions} />
        <div>
          <span className="mb-2 block text-[13px] font-semibold text-stone-600 dark:text-stone-300">{t(lang, "color")}</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                title={c.name}
                onClick={() => setColor(c.value)}
                className={`h-8 w-8 rounded-full transition ${color === c.value ? "ring-2 ring-offset-2 ring-[var(--brand)] dark:ring-offset-stone-900" : "hover:scale-110"}`}
                style={{ background: c.value }}
              />
            ))}
          </div>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} label={t(lang, "active")} />
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>{t(lang, "cancel")}</Button>
          <Button onClick={save}>{t(lang, "save")}</Button>
        </div>
      </div>
    </Modal>
  );
}
