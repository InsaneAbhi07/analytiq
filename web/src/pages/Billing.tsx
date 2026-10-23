import { useState } from "react";
import { Check, Download } from "lucide-react";
import clsx from "clsx";
import { plans, subscription } from "../data/seed";
import { useFeedback } from "../components/feedback";
import { Badge, Callout, Dl, Meter, PageHeader } from "../components/ui";
import { daysUntil, fmtDate, fmtShort, inr } from "../lib/ui";

export function PlanCards({ current, onPick }: { current?: string; onPick: (plan: string) => void }) {
  const [annual, setAnnual] = useState(false);
  return (
    <>
      <div className="mb-6 flex items-center justify-center gap-3 text-sm font-medium">
        <span className={!annual ? "text-ink-900" : "text-ink-500"}>Monthly</span>
        <button role="switch" aria-checked={annual} aria-label="Bill annually" onClick={() => setAnnual((a) => !a)}
          className={clsx("relative h-6 w-11 rounded-full transition", annual ? "bg-brand-600" : "bg-ink-300")}>
          <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", annual ? "left-[22px]" : "left-0.5")} />
        </button>
        <span className={annual ? "text-ink-900" : "text-ink-500"}>Annual</span>
        <Badge tone="success">2 months free</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => (
          <div key={p.name} className={clsx("card relative flex flex-col p-6", p.highlight && "border-brand-400 ring-4 ring-brand-100")}>
            {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-brand-600 to-ai-500 px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="min-h-[2.6em] text-sm text-ink-500">{p.tagline}</p>
            <div className="mt-3 font-display text-3xl font-bold tracking-tight">
              {p.monthly == null ? "Custom" : inr(annual ? p.annual! : p.monthly)}
              {p.monthly != null && <span className="text-sm font-medium text-ink-500"> /{annual ? "year" : "month"}</span>}
            </div>
            <div className="text-xs text-ink-500">{p.monthly == null ? "Talk to sales" : "+ GST · sample price"}</div>
            <ul className="my-5 space-y-2 text-sm">
              {[`${p.jobs} active jobs`, `${p.credits} resume credits`, `${p.seats} recruiter seats`, `${p.storage} storage`, ...p.features].map((f) => (
                <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />{f}</li>
              ))}
            </ul>
            <button disabled={p.name === current} onClick={() => onPick(p.name)} className={clsx("btn mt-auto w-full", p.highlight ? "btn-primary" : "btn-secondary")}>
              {p.name === current ? "Current plan" : p.monthly == null ? "Contact sales" : current ? `Switch to ${p.name}` : "Start free trial"}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-ink-500">Prices are sample values for the prototype. Real pricing is configured by the platform admin.</p>
    </>
  );
}

export default function Billing() {
  const { toast, confirm } = useFeedback();
  const sub = subscription;
  const plan = plans.find((p) => p.name === sub.plan)!;

  const pick = async (name: string) => {
    const res = await confirm({ title: `Switch to ${name}?`, message: "In demo billing mode no payment is taken. With a live gateway you'd go to checkout, and the change applies only after the provider confirms payment.", ok: "Continue" });
    if (res) toast(`Plan change to ${name} recorded as pending (demo billing mode).`, "info");
  };

  return (
    <>
      <PageHeader title="Billing & usage" subtitle="Manage your subscription, usage limits and invoices." />
      <Callout tone="warning" className="mb-4"><strong>Demo billing mode.</strong> No payment gateway is configured, so no real charges are made and no payment is shown as successful without provider confirmation.</Callout>

      <div className="mb-6 grid gap-4 lg:grid-cols-12">
        <section className="card lg:col-span-5">
          <div className="card-head"><h2 className="card-title">Current plan</h2><Badge tone="success">{sub.status}</Badge></div>
          <div className="p-5">
            <div className="flex items-baseline gap-2"><span className="font-display text-2xl font-bold">{sub.plan}</span><span className="text-ink-500">· {sub.cycle}</span></div>
            <div className="mb-4 text-sm text-ink-500">{inr(plan.monthly!)} / month + GST · sample price</div>
            <Dl items={[["Billing period", `${fmtShort(sub.periodStart)} – ${fmtDate(sub.renewsOn)}`], ["Renews on", `${fmtDate(sub.renewsOn)} (in ${daysUntil(sub.renewsOn)} days)`], ["Payment status", "Paid (demo billing mode)"], ["Grace period", "7 days after a failed renewal, then read-only"]]} />
          </div>
        </section>
        <section className="card lg:col-span-7">
          <div className="card-head"><div><h2 className="card-title">Usage this period</h2><div className="card-sub">Limits are enforced on the server. At 100%, new actions of that type are blocked.</div></div></div>
          <div className="space-y-4 p-5">
            {sub.usage.map((u) => {
              const pct = Math.round((u.used / u.limit) * 100);
              return (
                <div key={u.name}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{u.name}</span><span className="tabular-nums">{u.used}{u.unit && ` ${u.unit}`} of {u.limit}{u.unit && ` ${u.unit}`} <span className="text-ink-500">({pct}%)</span></span></div>
                  <Meter value={pct} tone={pct >= 100 ? "danger" : pct >= 80 ? "warn" : "brand"} />
                  {pct >= 80 && <p className="mt-1 text-xs text-amber-700">Approaching limit. Admins are notified at 80% and 100%.</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <h2 className="mb-4 text-lg font-bold">Plans</h2>
      <PlanCards current={sub.plan} onPick={pick} />

      <section className="card mt-6 overflow-hidden">
        <div className="card-head"><h2 className="card-title">Billing history</h2><span className="text-xs text-ink-500">GST invoices</span></div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Invoice</th><th>Issued</th><th className="text-right">Amount (incl. GST)</th><th>Status</th><th /></tr></thead>
            <tbody>
              {sub.invoices.map((i) => (
                <tr key={i.number}>
                  <td className="font-medium">{i.number}</td>
                  <td className="text-sm">{fmtDate(i.issued)}</td>
                  <td className="text-right tabular-nums">{inr(i.amount, 2)}</td>
                  <td><Badge tone="success">{i.status}</Badge> <Badge>demo</Badge></td>
                  <td className="text-right"><button className="btn btn-ghost btn-sm" onClick={() => toast("Invoice PDF downloads here in the full build.", "info")}><Download size={14} /> PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
