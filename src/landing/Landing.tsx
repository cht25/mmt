import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Check,
  Download,
  Landmark,
  LayoutDashboard,
  MessageCircle,
  Moon,
  Printer,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Sun,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";
import { useInstallPrompt, isStandalone } from "../lib/pwa";
import type { AppState, Gateway, Lang } from "../types";
import { defaultState } from "../lib/calc";

const KEY = "mmt-talikhata-v1";

function loadGateways(): Gateway[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState().settings.gateways;
    const parsed = JSON.parse(raw) as AppState;
    return parsed?.settings?.gateways?.length ? parsed.settings.gateways : defaultState().settings.gateways;
  } catch {
    return defaultState().settings.gateways;
  }
}

const FEATURES = [
  { icon: LayoutDashboard, bn: "ড্যাশবোর্ড", en: "Dashboard", d_bn: "মোট পাওনা-দেনা, আজকের বিক্রি ও আদায় এক নজরে", d_en: "Receivable, payable, today's sales & collections at a glance" },
  { icon: BookOpenText, bn: "গ্রাহকের খাতা", en: "Customer Khata", d_bn: "দেনা-পাওনা হিসাব, চলমান ব্যালেন্স ও বিবরণী", d_en: "Running balance & full statement per customer" },
  { icon: ReceiptText, bn: "লেনদেন এন্ট্রি", en: "Quick Entries", d_bn: "বিক্রি, আদায়, কেনা, পরিশোধ — এক ট্যাপে", d_en: "Sale, collection, purchase, payment — one tap" },
  { icon: BarChart3, bn: "রিপোর্ট", en: "Reports", d_bn: "মাসিক সারাংশ, বাকি তালিকা, CSV ডাউনলোড", d_en: "Monthly summary, due lists, CSV export" },
  { icon: Printer, bn: "প্রিন্ট স্টেটমেন্ট", en: "Print Statement", d_bn: "স্বাক্ষরসহ A4 খাতার বিবরণী প্রিন্ট", d_en: "A4 statement with signature, ready to print" },
  { icon: WifiOff, bn: "অফলাইন চলবে", en: "Works Offline", d_bn: "নেট ছাড়াও খাতা চালান, পরে সিঙ্ক হয়", d_en: "Keep records without internet" },
  { icon: ShieldCheck, bn: "নিরাপদ ব্যাকআপ", en: "Safe Backup", d_bn: "এক ক্লিকে JSON ব্যাকআপ ও রিস্টোর", d_en: "One-click JSON backup & restore" },
  { icon: Moon, bn: "ডার্ক মোড", en: "Dark Mode", d_bn: "চোখের আরামে রাতেও কাজ করুন", d_en: "Comfortable at night too" },
];

const STEPS = [
  { bn: "ওয়েব অ্যাপ খুলুন", en: "Open the web app anywhere — computer or phone browser. No install needed." },
  { bn: "খাতা লিখুন", en: "Add customers, record sales & collections. Balances update automatically." },
  { bn: "অ্যাপ বানান (PWA)", en: "Press Install on Android/Chrome, or Add to Home Screen on iPhone — it works like an app." },
];

const INSTALL_STEPS_ANDROID = ["Chrome-এ মেনু (⋮) চাপুন", '"App install করুন" / "Add to Home screen" চাপুন', "হয়ে গেছে! হোম স্ক্রিন থেকে অ্যাপের মতো খুলুন"];
const INSTALL_STEPS_IOS = ["Safari-এ Share (⬆️) বাটন চাপুন", '"Add to Home Screen" চাপুন', "হয়ে গেছে! হোম স্ক্রিন থেকে অ্যাপের মতো খুলুন"];

const t = (lang: Lang, bn: string, en: string) => (lang === "bn" ? bn : en);

export default function Landing() {
  const [lang, setLang] = useState<Lang>("bn");
  const [showInstall, setShowInstall] = useState(false);
  const [installMsg, setInstallMsg] = useState("");
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const gateways = useMemo(loadGateways, []);
  const [gs, setGs] = useState<Gateway[]>(gateways);

  useEffect(() => {
    document.documentElement.lang = lang;
    const iv = setInterval(() => {
      const next = loadGateways();
      setGs(next);
    }, 4000);
    return () => clearInterval(iv);
  }, [lang]);

  const enabled = gs.filter((g) => g.enabled);
  const now = new Date().getFullYear();

  const doInstall = async () => {
    const res = await promptInstall();
    if (res === "installed") {
      setInstallMsg(t(lang, "অ্যাপ ইনস্টল হয়েছে ✓ হোম স্ক্রিন থেকে খুলুন", "App installed ✓ Open it from your home screen"));
    } else {
      setShowInstall(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f4] text-stone-800 dark:bg-[#0d1512] dark:text-stone-100">
      {/* ===== Nav ===== */}
      <header className="sticky top-0 z-40 border-b border-stone-200/60 bg-white/85 backdrop-blur dark:border-stone-800 dark:bg-stone-900/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/icon-192.png" alt="MM" className="h-10 w-10 rounded-xl shadow-md" />
            <div>
              <p className="text-[15px] font-bold leading-tight">Mahi And Muhi Traders</p>
              <p className="text-[11px] font-semibold text-[var(--brand)]">{t(lang, "ডিজিটাল তালি খাতা", "Digital Tali Khata")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              className="rounded-xl bg-stone-100 px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
            >
              {lang === "bn" ? "EN" : "বাং"}
            </button>
            <a
              href="/app.html"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[var(--brand)]/25 transition hover:bg-[var(--brand-strong)] active:scale-[0.98]"
            >
              {t(lang, "অ্যাপ খুলুন", "Open App")} <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-[var(--brand)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Check size={13} /> {t(lang, "ফ্রি ও কোনো অ্যাপ ডাউনলোড লাগবে না", "Free — no APK download needed")}
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              {t(lang, "দোকানের সব দেনা-পাওনা", "All your shop's credits & dues,")}{" "}
              <span className="text-[var(--brand)]">{t(lang, "এক খাতায়", "in one khata")}</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-stone-500 dark:text-stone-400">
              {t(
                lang,
                "মাহি অ্যান্ড মুহি ট্রেডার্সের ডিজিটাল তালি খাতা — গ্রাহক যোগ করুন, বিক্রি-আদায় লিখুন, ব্যালেন্স অটো মিলবে। চাইলে মোবাইল/কম্পিউটার থেকে অ্যাপের মতো ইনস্টল করে ব্যবহার করুন।",
                "The Digital Tali Khata of Mahi And Muhi Traders — add customers, record sales & collections, balances update automatically. Install it as an app on phone or computer, or just use it in the browser.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/app.html"
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[var(--brand)]/30 transition hover:bg-[var(--brand-strong)] active:scale-[0.98]"
              >
                <BookOpenText size={18} /> {t(lang, "এখনই খাতা খুলুন", "Open the Khata now")}
              </a>
              <button
                onClick={doInstall}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--brand)] bg-white px-5 py-3 text-base font-bold text-[var(--brand)] transition hover:bg-[var(--brand)]/5 active:scale-[0.98] dark:bg-stone-900"
              >
                <Download size={18} />
                {installed
                  ? t(lang, "ইনস্টল হয়েছে ✓", "Installed ✓")
                  : canInstall
                    ? t(lang, "অ্যাপ ইনস্টল করুন", "Install app")
                    : t(lang, "অ্যাপ ইনস্টল করবেন কীভাবে?", "How to install?")}
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-stone-400">
              <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> {t(lang, "অফলাইনেও চলে", "Works offline")}</span>
              <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> {t(lang, "ডেটা আপনার ফোনে", "Data stays on your device")}</span>
              <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-500" /> {t(lang, "প্রিন্ট ও CSV", "Print & CSV")}</span>
            </div>
          </div>

          {/* phone mockup */}
          <div className="relative mx-auto w-full max-w-[340px]">
            <div className="rounded-[2.4rem] border-[10px] border-stone-800 bg-white shadow-2xl dark:border-stone-700">
              <div className="rounded-[1.8rem] bg-[#f4f6f4] p-4 dark:bg-[#0d1512]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
                    <div>
                      <p className="text-[11px] font-bold leading-none">M&M Traders</p>
                      <p className="text-[9px] text-stone-400">তালি খাতা</p>
                    </div>
                  </div>
                  <Sun size={14} className="text-stone-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white p-2.5 shadow-sm dark:bg-stone-800">
                    <p className="text-[9px] text-stone-400">{t(lang, "মোট পাওনা", "Receivable")}</p>
                    <p className="num text-sm font-black text-emerald-600">৳46,650</p>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 shadow-sm dark:bg-stone-800">
                    <p className="text-[9px] text-stone-400">{t(lang, "মোট দেনা", "Payable")}</p>
                    <p className="num text-sm font-black text-rose-500">৳23,500</p>
                  </div>
                </div>
                <div className="mt-2 rounded-xl bg-[var(--brand)] p-2.5 text-white">
                  <p className="text-[9px] opacity-80">{t(lang, "আজকের বিক্রি", "Today's sales")}</p>
                  <p className="num text-base font-black">৳3,200</p>
                  <div className="mt-1.5 flex gap-1">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <span key={i} className="w-full rounded-sm bg-white/30" style={{ height: (h / 90) * 34 }} />
                    ))}
                  </div>
                </div>
                <div className="mt-2 space-y-1.5">
                  {[
                    { n: "রফিকুল ইসলাম", b: "৳5,500", c: "text-rose-500" },
                    { n: "সুমিতা দাস", b: "৳3,800", c: "text-rose-500" },
                    { n: "নাসির ট্রেডার্স", b: "৳3,500", c: "text-amber-500" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white px-2.5 py-2 shadow-sm dark:bg-stone-800">
                      <span className="text-[10px] font-semibold">{r.n}</span>
                      <span className={`num text-[11px] font-black ${r.c}`}>{r.b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -left-6 hidden items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-xs font-bold shadow-xl dark:bg-stone-800 sm:flex">
              <WifiOff size={14} className="text-emerald-500" /> {t(lang, "অফলাইনেও চলে", "Offline ready")}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="border-y border-stone-200/60 bg-white py-14 dark:border-stone-800 dark:bg-stone-900/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-black sm:text-3xl">
              {t(lang, "মূল ফিচারগুলো", "Key features")}
            </h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              {t(lang, "তালি খাতার সব কিছু — ডিজিটাল, সহজ, দ্রুত।", "Everything a Tali Khata needs — digital, simple, fast.")}
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.en} className="rounded-2xl border border-stone-200/80 bg-[#f4f6f4] p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
                  <f.icon size={20} />
                </div>
                <p className="mt-3 font-bold">{t(lang, f.bn, f.en)}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-stone-500 dark:text-stone-400">{t(lang, f.d_bn, f.d_en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-black sm:text-3xl">{t(lang, "কীভাবে কাজ করে", "How it works")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={i} className="relative rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand)] text-sm font-black text-white">{i + 1}</span>
              <p className="mt-3 font-bold">{s.bn}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-stone-500 dark:text-stone-400">{s.en}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <p className="flex items-center gap-2 font-bold"><Smartphone size={17} className="text-[var(--brand)]" /> {t(lang, "Android / Chrome-এ ইনস্টল", "Install on Android / Chrome")}</p>
            <ol className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
              {INSTALL_STEPS_ANDROID.map((s, i) => (
                <li key={i} className="flex gap-2"><span className="font-black text-[var(--brand)]">{i + 1}.</span> {s}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <p className="flex items-center gap-2 font-bold"><Smartphone size={17} className="text-[var(--brand)]" /> {t(lang, "iPhone / iPad-এ ইনস্টল", "Install on iPhone / iPad")}</p>
            <ol className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
              {INSTALL_STEPS_IOS.map((s, i) => (
                <li key={i} className="flex gap-2"><span className="font-black text-[var(--brand)]">{i + 1}.</span> {s}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ===== Payments ===== */}
      <section className="border-y border-stone-200/60 bg-white py-12 dark:border-stone-800 dark:bg-stone-900/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black sm:text-2xl">{t(lang, "পেমেন্ট মাধ্যম", "Payment methods")}</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {t(lang, "উপরের মাধ্যমগুলোতে আদায়/পরিশোধ করা যায় — অ্যাডমিন প্যানেল থেকে আপডেট করুন।", "Collect & pay through these — update them from the admin panel.")}
              </p>
            </div>
            <a href="/app.html" className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300">
              {t(lang, "অ্যাডমিন প্যানেল", "Admin panel")} <ArrowRight size={14} />
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {enabled.map((g) => (
              <div key={g.id} className="flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-[#f4f6f4] px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
                <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: g.color || "#0c6b4e" }}>
                  {g.type === "bank" ? <Landmark size={16} /> : g.type === "mobile" ? <Wallet size={16} /> : <Smartphone size={16} />}
                </span>
                <div>
                  <p className="text-sm font-bold">{g.name}</p>
                  <p className="num text-xs text-stone-500 dark:text-stone-400">{g.accountNo || "—"}</p>
                </div>
              </div>
            ))}
            {enabled.length === 0 && (
              <p className="text-sm text-stone-400">{t(lang, "এখনও কোনো পেমেন্ট মাধ্যম যোগ করা হয়নি।", "No payment methods added yet.")}</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-[var(--brand)] px-6 py-12 text-center text-white shadow-2xl shadow-[var(--brand)]/30">
          <h2 className="text-2xl font-black sm:text-3xl">{t(lang, "আজই ডিজিটাল খাতা শুরু করুন", "Start your digital khata today")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm opacity-85">
            {t(lang, "কোনো ইনস্টল, কোনো লগইন নেই — শুধু খুলে লিখুন।", "No install, no login — just open and start writing.")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/app.html" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-[var(--brand)] shadow-lg transition hover:scale-[1.02]">
              <BookOpenText size={18} /> {t(lang, "এখনই ব্যবহার করুন", "Use it now")}
            </a>
            <button onClick={doInstall} className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/70 px-5 py-3.5 font-bold text-white transition hover:bg-white/10">
              <Download size={18} /> {t(lang, "অ্যাপ ইনস্টল", "Install app")}
            </button>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-stone-200/60 bg-white py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
            <div>
              <p className="text-sm font-bold">Mahi And Muhi Traders</p>
              <p className="text-xs text-stone-400">{t(lang, "ডিজিটাল তালি খাতা", "Digital Tali Khata")} · © {now}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
            <span className="inline-flex items-center gap-1"><RefreshCcw size={12} /> v1.1</span>
            <a href="/app.html" className="hover:text-[var(--brand)]">{t(lang, "অ্যাপ", "App")}</a>
            <a href="/app.html#settings" className="hover:text-[var(--brand)]">{t(lang, "অ্যাডমিন", "Admin")}</a>
          </div>
        </div>
      </footer>

      {/* ===== Install instructions modal ===== */}
      {showInstall && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowInstall(false)} />
          <div className="animate-modal relative w-full max-w-md rounded-t-3xl bg-white p-6 dark:bg-stone-900 sm:rounded-3xl">
            <div className="mb-4 flex items-center gap-3">
              <img src="/icon-192.png" alt="" className="h-12 w-12 rounded-2xl shadow" />
              <div>
                <p className="font-black">M&M Tali Khata</p>
                <p className="text-xs text-stone-400">{t(lang, "হোম স্ক্রিনে অ্যাপের মতো যোগ করুন", "Add it to your home screen like an app")}</p>
              </div>
            </div>
            <p className="text-sm font-bold">{t(lang, "Android / Chrome", "Android / Chrome")}</p>
            <ol className="mt-2 space-y-1.5 text-sm text-stone-600 dark:text-stone-300">
              {INSTALL_STEPS_ANDROID.map((s, i) => (
                <li key={i} className="flex gap-2"><span className="font-black text-[var(--brand)]">{i + 1}.</span> {s}</li>
              ))}
            </ol>
            <p className="mt-4 text-sm font-bold">{t(lang, "iPhone / iPad (Safari)", "iPhone / iPad (Safari)")}</p>
            <ol className="mt-2 space-y-1.5 text-sm text-stone-600 dark:text-stone-300">
              {INSTALL_STEPS_IOS.map((s, i) => (
                <li key={i} className="flex gap-2"><span className="font-black text-[var(--brand)]">{i + 1}.</span> {s}</li>
              ))}
            </ol>
            {installMsg && <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{installMsg}</p>}
            <button
              onClick={() => setShowInstall(false)}
              className="mt-5 w-full rounded-xl bg-[var(--brand)] py-3 font-bold text-white transition hover:bg-[var(--brand-strong)]"
            >
              {t(lang, "বুঝেছি", "Got it")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
