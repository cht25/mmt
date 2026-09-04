import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Moon,
  Plus,
  ReceiptText,
  Settings as SettingsIcon,
  Sun,
  Users,
} from "lucide-react";
import type { View } from "./types";
import { StoreContext, type StoreApi } from "./lib/store-context";
import { useAppStore } from "./lib/store";
import { t } from "./lib/format";
import Dashboard from "./components/Dashboard";
import Customers from "./components/Customers";
import CustomerLedger from "./components/CustomerLedger";
import Transactions from "./components/Transactions";
import Reports from "./components/Reports";
import SettingsPage from "./components/SettingsPage";
import { AddTxnModal, CustomerFormModal } from "./components/Modals";
import { Modal } from "./components/ui";

const NAV: { key: View; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "customers", icon: Users },
  { key: "transactions", icon: ReceiptText },
  { key: "reports", icon: BarChart3 },
  { key: "settings", icon: SettingsIcon },
];

export default function App() {
  const store = useAppStore();
  const [view, setView] = useState<View>("dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [addTxnOpen, setAddTxnOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const s = store.state;
  const lang = s.settings.language;
  const dark = s.settings.dark;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.setProperty("--brand", s.settings.themeColor);
    document.documentElement.style.setProperty(
      "--brand-strong",
      `color-mix(in srgb, ${s.settings.themeColor} 88%, black)`,
    );
    document.documentElement.lang = lang;
  }, [dark, s.settings.themeColor, lang]);

  const go = (v: View) => {
    if (v === "customers") setSelectedCustomerId(null);
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const selectedCustomer = useMemo(
    () => s.customers.find((c) => c.id === selectedCustomerId) ?? null,
    [s.customers, selectedCustomerId],
  );

  const openCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setView("customer");
    window.scrollTo({ top: 0 });
  };

  const ctx: StoreApi = store;

  return (
    <StoreContext.Provider value={ctx}>
      <div className="min-h-screen bg-[#f4f6f4] text-stone-800 dark:bg-[#0d1512] dark:text-stone-100">
        {/* Desktop sidebar */}
        <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-900 lg:flex">
          <Brand />
          <nav className="mt-2 flex-1 space-y-1 px-3">
            {NAV.map(({ key, icon: Icon }) => (
              <NavButton
                key={key}
                active={view === key}
                onClick={() => go(key)}
                icon={<Icon size={18} />}
                label={t(lang, key === "customers" ? "customers" : key)}
              />
            ))}
            <div className="pt-4">
              <button
                onClick={() => setAddTxnOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[var(--brand)]/25 transition hover:bg-[var(--brand-strong)] active:scale-[0.98]"
              >
                <Plus size={17} /> {t(lang, "addTxn")}
              </button>
            </div>
          </nav>
          <div className="border-t border-stone-100 px-5 py-4 dark:border-stone-800">
            <p className="truncate text-sm font-bold text-stone-700 dark:text-stone-200">{s.settings.shopName}</p>
            <p className="text-xs text-stone-400">{t(lang, "appName")}</p>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="no-print sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200/80 bg-white/90 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90 lg:hidden">
          <button
            onClick={() => {
              setView("dashboard");
              setSelectedCustomerId(null);
            }}
            className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand)] font-black text-white shadow-md shadow-[var(--brand)]/30"
            aria-label="Home"
          >
            <span className="text-[13px]">MM</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold leading-tight">{s.settings.shopName}</p>
            <p className="truncate text-xs text-stone-400">{t(lang, "appName")}</p>
          </div>
          <button
            onClick={() => setAddTxnOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/30 active:scale-95"
            aria-label={t(lang, "addTxn")}
          >
            <Plus size={20} />
          </button>
          <button
            onClick={() => store.updateSettings({ dark: !dark })}
            className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-300"
            aria-label="Theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* Main */}
        <main className="px-4 pb-28 pt-4 sm:px-6 lg:ml-64 lg:pb-10 lg:pt-6 xl:px-10">
          <div className="mx-auto max-w-6xl">
            {view === "dashboard" && (
              <Dashboard onOpenCustomer={openCustomer} onAddTxn={() => setAddTxnOpen(true)} onAddCustomer={() => setAddCustomerOpen(true)} />
            )}
            {view === "customers" && (
              <Customers onOpenCustomer={openCustomer} onAdd={() => setAddCustomerOpen(true)} />
            )}
            {view === "customer" && selectedCustomer && (
              <CustomerLedger customerId={selectedCustomer.id} onBack={() => go("customers")} onAddTxn={() => setAddTxnOpen(true)} />
            )}
            {view === "transactions" && <Transactions onAddTxn={() => setAddTxnOpen(true)} />}
            {view === "reports" && <Reports />}
            {view === "settings" && <SettingsPage />}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-stone-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-stone-800 dark:bg-stone-900/95 lg:hidden">
          <div className="grid grid-cols-5">
            {NAV.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => go(key)}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                  view === key ? "text-[var(--brand)]" : "text-stone-400"
                }`}
              >
                <Icon size={20} strokeWidth={view === key ? 2.4 : 2} />
                {t(lang, key === "customers" ? "customers" : key)}
              </button>
            ))}
          </div>
        </nav>

        <AddTxnModal
          open={addTxnOpen}
          onClose={() => setAddTxnOpen(false)}
          presetCustomerId={selectedCustomerId}
        />
        <CustomerFormModal open={addCustomerOpen} onClose={() => setAddCustomerOpen(false)} />
      </div>
    </StoreContext.Provider>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-5 dark:border-stone-800">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--brand)] text-[15px] font-black text-white shadow-lg shadow-[var(--brand)]/30">
        MM
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold leading-tight text-stone-800 dark:text-stone-100">
          Mahi And Muhi
        </p>
        <p className="text-xs font-medium text-[var(--brand)]">Traders · Tali Khata</p>
      </div>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[var(--brand)]/10 text-[var(--brand)]"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
