import { LANG } from "./i18n";
import type { AppState, Lang } from "../types";

/** Format a numeric amount with thousand separators. */
export function fmtNum(n: number, bengali = false): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const fixed = Math.round(abs * 100) / 100;
  const [int, frac] = fixed.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const parts = frac === "00" ? [grouped] : [grouped, frac.replace(/0$/, "")];
  let out = parts.join(".");
  if (bengali) out = toBengaliDigits(out);
  return neg ? `-${out}` : out;
}

const BN_DIGITS: Record<string, string> = {
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
  "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
};

export function toBengaliDigits(s: string): string {
  return s.replace(/[0-9]/g, (d) => BN_DIGITS[d]);
}

export function amountStr(n: number, lang: Lang, bengaliDigits: boolean): string {
  return fmtNum(n, lang === "bn" && bengaliDigits);
}

export function money(n: number, s: AppState): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}৳${fmtNum(Math.abs(n), s.settings.language === "bn" && s.settings.bengaliDigits)}`;
}

export function moneySigned(n: number, s: AppState): string {
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}৳${fmtNum(Math.abs(n), s.settings.language === "bn" && s.settings.bengaliDigits)}`;
}

/** Format 2025-09-04 in the app language. */
export function fmtDate(iso: string, lang: Lang, bengaliDigits: boolean): string {
  try {
    const d = new Date(iso + "T00:00:00");
    const s = lang === "bn"
      ? d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })
      : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return bengaliDigits && lang === "bn" ? toBengaliDigits(s) : s;
  } catch {
    return iso;
  }
}

export function fmtDateShort(iso: string, lang: Lang, bengaliDigits: boolean): string {
  try {
    const d = new Date(iso + "T00:00:00");
    const s = lang === "bn"
      ? d.toLocaleDateString("bn-BD", { day: "2-digit", month: "2-digit", year: "2-digit" })
      : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    return bengaliDigits && lang === "bn" ? toBengaliDigits(s) : s;
  } catch {
    return iso;
  }
}

export function monthLabel(ym: string, lang: Lang): string {
  try {
    const d = new Date(ym + "-01T00:00:00");
    const s = lang === "bn"
      ? d.toLocaleDateString("bn-BD", { month: "long", year: "numeric" })
      : d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    return s;
  } catch {
    return ym;
  }
}

export function weekdayLabel(dateStr: string, lang: Lang): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { weekday: "short" });
  } catch {
    return "";
  }
}

export function t(lang: Lang, key: keyof typeof LANG.bn): string {
  return LANG[lang][key] ?? key;
}
