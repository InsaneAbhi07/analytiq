import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { scoreBand, type Tone } from "../lib/ui";

const toneClass: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-600",
  brand: "bg-brand-50 text-brand-700",
  info: "bg-sky-50 text-sky-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  violet: "bg-fuchsia-50 text-fuchsia-700",
  teal: "bg-ai-50 text-ai-700",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", toneClass[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

const bandColor = { high: "#10b981", mid: "#f59e0b", low: "#9d9db3" };

/** Circular match score. null = not screened yet. */
export function ScoreRing({ score, size = 40 }: { score: number | null | undefined; size?: number }) {
  const stroke = size > 60 ? 8 : 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const has = score != null;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={has ? `Match score ${score} out of 100` : "Not screened"}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ebebf3" strokeWidth={stroke} />
        {has && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bandColor[scoreBand(score)]} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
        )}
      </svg>
      <span className={clsx("absolute font-semibold tabular-nums", size > 60 ? "text-3xl tracking-tight" : "text-xs", !has && "text-ink-400")}>{has ? score : "—"}</span>
    </span>
  );
}

const avatarColors = ["bg-brand-100 text-brand-700", "bg-ai-100 text-ai-700", "bg-amber-100 text-amber-800", "bg-sky-100 text-sky-700", "bg-rose-100 text-rose-700", "bg-emerald-100 text-emerald-700"];

export function Avatar({ name, initials, size = "md" }: { name: string; initials: string; size?: "sm" | "md" | "lg" }) {
  const color = avatarColors[[...name].reduce((s, ch) => s + ch.charCodeAt(0), 0) % avatarColors.length];
  return (
    <span aria-hidden className={clsx("inline-grid shrink-0 place-items-center rounded-full font-semibold", color,
      size === "sm" && "h-6 w-6 text-[0.6rem]", size === "md" && "h-8 w-8 text-[0.7rem]", size === "lg" && "h-14 w-14 text-base")}>
      {initials}
    </span>
  );
}

export function Meter({ value, tone = "brand", className }: { value: number; tone?: "brand" | "ai" | "warn" | "danger" | "muted"; className?: string }) {
  const c = { brand: "bg-brand-500", ai: "bg-ai-500", warn: "bg-amber-500", danger: "bg-rose-500", muted: "bg-ink-300" }[tone];
  return (
    <div className={clsx("h-2 overflow-hidden rounded-full bg-ink-100", className)}>
      <div className={clsx("h-full rounded-full transition-all", c)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, crumbs }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; crumbs?: ReactNode }) {
  return (
    <div className="mb-5">
      {crumbs && <div className="mb-1.5 text-xs text-ink-500">{crumbs}</div>}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.45rem] font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Callout({ tone = "neutral", icon, children, className }: { tone?: "neutral" | "info" | "warning" | "danger" | "ai"; icon?: ReactNode; children: ReactNode; className?: string }) {
  const c = {
    neutral: "border-ink-200 bg-ink-50 text-ink-700",
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-rose-200 bg-rose-50 text-rose-900",
    ai: "border-ai-100 bg-ai-50 text-ai-700",
  }[tone];
  return (
    <div className={clsx("flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-[0.83rem]", c, className)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center text-ink-500">
      <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-ink-100 text-ink-400">{icon}</div>
      <h3 className="text-[0.95rem] font-semibold text-ink-900">{title}</h3>
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("textarea, input, select, button:not([aria-label='Close'])")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal aria-label={title} className={clsx("w-full animate-slide-in rounded-2xl bg-white shadow-pop", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
          <h2 className="text-base font-semibold">{title}</h2>
          <button className="btn btn-ghost btn-sm -mr-2 p-1.5" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Dl({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(110px,38%)_1fr] gap-x-4 gap-y-2.5 text-sm">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-500">{k}</dt>
          <dd className="min-w-0 text-ink-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
