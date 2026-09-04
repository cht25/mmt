import { useRef, useState } from "react";
import { Database, Download, FileJson, Palette, RotateCcw, Trash2, Upload } from "lucide-react";
import { useStore } from "../lib/store-context";
import { t } from "../lib/format";
import { Badge, Button, Card, Input, Toggle } from "./ui";

const COLORS = [
  { name: "Green", value: "#0c6b4e" },
  { name: "Teal", value: "#0f766e" },
  { name: "Blue", value: "#1d4ed8" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Rose", value: "#be123c" },
  { name: "Orange", value: "#c2410c" },
  { name: "Slate", value: "#334155" },
];

export default function SettingsPage() {
  const { state, updateSettings, importState, resetAll, loadDemo } = useStore();
  const lang = state.settings.language;
  const [shopName, setShopName] = useState(state.settings.shopName);
  const [ownerName, setOwnerName] = useState(state.settings.ownerName);
  const [phone, setPhone] = useState(state.settings.phone);
  const [address, setAddress] = useState(state.settings.address);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveProfile = () => {
    updateSettings({ shopName: shopName.trim() || "Mahi And Muhi Traders", ownerName: ownerName.trim(), phone: phone.trim(), address: address.trim() });
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

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t(lang, "settings")}</h1>
        <p className="text-sm text-stone-400">{state.settings.shopName}</p>
      </div>

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
        Mahi And Muhi Traders · {t(lang, "appName")} · v1.0
      </p>
    </div>
  );
}
