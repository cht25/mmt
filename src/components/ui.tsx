import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-stone-700/60 dark:bg-stone-900 ${onClick ? "cursor-pointer transition hover:border-[var(--brand)]/50 hover:shadow-md" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "brand",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "green" | "amber" | "rose" | "sky";
}) {
  const tones: Record<string, string> = {
    brand: "bg-[var(--brand)] text-white",
    green: "bg-emerald-500 text-white",
    amber: "bg-amber-400 text-stone-900",
    rose: "bg-rose-500 text-white",
    sky: "bg-sky-500 text-white",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-stone-500 dark:text-stone-400">{label}</p>
          <p className="num mt-0.5 truncate text-xl font-bold text-stone-800 dark:text-stone-100">{value}</p>
          {sub && <p className="mt-0.5 truncate text-xs text-stone-400 dark:text-stone-500">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "green" | "amber" | "rose" | "sky";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
    brand: "bg-[var(--brand)]/10 text-[var(--brand)]",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)] shadow-sm shadow-[var(--brand)]/30 disabled:opacity-50",
    secondary:
      "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700",
    ghost: "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    outline:
      "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  className = "",
  inputMode,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputMode?: "text" | "tel" | "numeric" | "decimal";
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-[13px] font-semibold text-stone-600 dark:text-stone-300">{label}</span>
      )}
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  children,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block text-[13px] font-semibold text-stone-600 dark:text-stone-300">{label}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] text-stone-800 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
      >
        {children}
      </select>
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`animate-modal relative max-h-[92vh] w-full ${width} overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-stone-900 sm:rounded-3xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95">
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center dark:border-stone-700 dark:bg-stone-900/40">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
        {icon}
      </div>
      <p className="font-semibold text-stone-700 dark:text-stone-200">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1 text-left"
    >
      {label && <span className="text-[14px] font-medium text-stone-700 dark:text-stone-200">{label}</span>}
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[var(--brand)]" : "bg-stone-300 dark:bg-stone-700"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="grid shrink-0 place-items-center rounded-full bg-[var(--brand)]/15 font-bold text-[var(--brand)]"
    >
      {initials || "?"}
    </div>
  );
}
