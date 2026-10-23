import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";
import {
  ArrowLeftRight, Building2, Cpu, FileText, HeartPulse, Layers, Menu, MoreHorizontal, ScrollText, Search, ShieldAlert, SlidersHorizontal, Gauge, X,
} from "lucide-react";
import { auditLog, planSubscribers, plans, processingJobs, tenants, type Tenant } from "../data/seed";
import { Logo } from "../components/layouts";
import { useFeedback } from "../components/feedback";
import { BarChart } from "../components/charts";
import { Badge, Meter, PageHeader } from "../components/ui";
import { ago, fmtDate, fmtDateTime, processingLabel, processingTone, severityTone, tenantTone } from "../lib/ui";
import type { ProcessingStatus } from "../data/types";

/** Platform Super Admin console: tenant-level aggregates only, never candidate resume content. */
export function AdminShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  const nav = [
    { to: "/admin", label: "Overview", icon: Gauge, end: true },
    { to: "/admin/companies", label: "Companies", icon: Building2 },
    { to: "/admin/plans", label: "Subscription plans", icon: Layers },
    { to: "/admin/processing", label: "AI processing", icon: Cpu },
    { to: "/admin/audit", label: "Security & audit", icon: ScrollText },
    { to: "/admin/system", label: "System settings", icon: SlidersHorizontal },
  ];
  return (
    <div className="min-h-screen">
      <aside className={clsx("fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#111014] text-ink-300 transition-transform lg:translate-x-0 lg:transition-none", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-5 pb-4 pt-5"><Link to="/admin"><Logo dark sub="Super Admin console" /></Link><button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
        <div className="mx-3 mb-3 flex items-center gap-2.5 rounded-xl bg-amber-400/10 px-3 py-2.5 ring-1 ring-amber-400/20">
          <ShieldAlert size={18} className="text-amber-400" />
          <div className="text-[0.8rem]"><div className="font-medium text-white">Platform scope</div><div className="text-[0.7rem] text-amber-200/70">No access to resume contents</div></div>
        </div>
        <nav className="flex-1 px-3">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => clsx("mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium", isActive ? "bg-amber-400/15 text-amber-200" : "hover:bg-white/5 hover:text-white")}>
              <n.icon size={17} />{n.label}
            </NavLink>
          ))}
          <div className="px-3 pb-1.5 pt-5 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-ink-500">Prototype</div>
          <Link to="/app" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/5 hover:text-white"><ArrowLeftRight size={17} /> Company workspace</Link>
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-ink-200"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />All services operational</div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-200/70 bg-white/85 px-4 backdrop-blur md:px-6">
          <button className="btn btn-ghost p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <span className="font-semibold">Analytiq Platform</span>
          <span className="ml-auto hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[0.7rem] font-semibold text-amber-700 sm:inline">Prototype · mock data</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">PA</span>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const active = tenants.filter((t) => t.status === "Active" || t.status === "Trial");
  const cards: [string, string, string][] = [
    ["Companies", `${tenants.length}`, `${active.length} active or trial`],
    ["Users", `${tenants.reduce((s, t) => s + t.users, 0)}`, "Across all tenants"],
    ["Active jobs", `${tenants.reduce((s, t) => s + t.activeJobs, 0)}`, "Published postings"],
    ["Resumes processed", tenants.reduce((s, t) => s + t.creditsUsed, 0).toLocaleString("en-IN"), "This billing period"],
    ["Suspended", `${tenants.filter((t) => t.status === "Suspended").length}`, "Payment overdue past grace"],
  ];
  return (
    <>
      <PageHeader title="Platform overview" subtitle="Aggregate, tenant-level metrics. Candidate data isn't visible from this console." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map(([l, v, f]) => <div key={l} className="card p-4"><div className="text-[0.8rem] font-medium text-ink-500">{l}</div><div className="mt-1 font-display text-2xl font-bold tabular-nums">{v}</div><div className="text-xs text-ink-500">{f}</div></div>)}
      </div>
      <div className="mb-4 grid gap-4 lg:grid-cols-12">
        <section className="card lg:col-span-5">
          <div className="card-head"><div><h2 className="card-title">Companies by plan</h2><div className="card-sub">Active and trial</div></div></div>
          <div className="p-5"><BarChart height={220} labels={plans.map((p) => p.name)} series={[{ label: "Companies", data: plans.map((p) => active.filter((t) => t.plan === p.name).length), color: "#f59e0b" }]} /></div>
        </section>
        <section className="card lg:col-span-7">
          <div className="card-head"><h2 className="card-title">Resume credit usage by tenant</h2><Link to="/admin/companies" className="text-sm font-medium text-brand-700 hover:underline">All companies</Link></div>
          <div className="space-y-3 p-5">
            {tenants.filter((t) => t.status !== "Deactivated").sort((a, b) => b.creditsUsed / b.creditsLimit - a.creditsUsed / a.creditsLimit).map((t) => {
              const pct = Math.round((t.creditsUsed / t.creditsLimit) * 100);
              return (
                <div key={t.id}>
                  <div className="mb-1 flex justify-between text-sm"><span>{t.name} <span className="text-ink-500">· {t.plan}</span></span><span className="tabular-nums">{t.creditsUsed.toLocaleString("en-IN")} / {t.creditsLimit.toLocaleString("en-IN")}</span></div>
                  <Meter value={pct} tone={pct >= 100 ? "danger" : pct >= 80 ? "warn" : "brand"} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card lg:col-span-7">
          <div className="card-head"><h2 className="card-title">Recent security &amp; audit events</h2><Link to="/admin/audit" className="text-sm font-medium text-brand-700 hover:underline">View all</Link></div>
          {auditLog.slice(0, 5).map((e, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-ink-100 px-5 py-3 last:border-0">
              <Badge tone={severityTone(e.severity)} className="w-16 justify-center">{e.severity}</Badge>
              <div className="min-w-0 flex-1"><div className="text-sm font-medium">{e.action}</div><div className="truncate text-xs text-ink-500">{e.company} · {e.actor}</div></div>
              <span className="text-xs text-ink-500">{ago(e.on)}</span>
            </div>
          ))}
        </section>
        <section className="card lg:col-span-5">
          <div className="card-head"><h2 className="card-title">Service health</h2></div>
          {[["Web application", true, "p95 latency 180 ms"], ["AI service (FastAPI)", true, "2 workers · model loaded"], ["Processing queue", true, `${processingJobs.filter((j) => j.status === "Queued" || j.status === "Processing").length} in queue`], ["SQL Server", true, "Last backup 03:00 IST"], ["Email (SMTP)", false, "Not configured · notifications queued"]].map(([n, ok, d]) => (
            <div key={n as string} className="flex items-center gap-3 border-b border-ink-100 px-5 py-3 last:border-0">
              <span className={clsx("h-2 w-2 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} />
              <div className="flex-1"><div className="text-sm font-medium">{n}</div><div className="text-xs text-ink-500">{d}</div></div>
              <span className="text-xs">{ok ? "Operational" : "Attention"}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export function AdminCompanies() {
  const { toast, confirm } = useFeedback();
  const [rows, setRows] = useState<Tenant[]>(tenants);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [menu, setMenu] = useState<number | null>(null);
  const list = useMemo(() => rows.filter((t) => (!q || `${t.name} ${t.email} ${t.city}`.toLowerCase().includes(q.toLowerCase())) && (!status || t.status === status)), [rows, q, status]);

  const act = async (t: Tenant, title: string, message: string, to?: Tenant["status"], danger = false) => {
    setMenu(null);
    const res = await confirm({ title, message, ok: title.replace("?", ""), reason: true, danger });
    if (!res) return;
    if (to) setRows((r) => r.map((x) => (x.id === t.id ? { ...x, status: to } : x)));
    toast(`${title.replace("?", "")} recorded for ${t.name} and written to the audit log.`);
  };

  return (
    <>
      <PageHeader title="Companies" subtitle={`${rows.length} registered tenants. Status changes are audited and the company admin is notified.`} />
      <div className="card overflow-visible">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input className="input pl-9" placeholder="Search company, email or city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search companies" /></div>
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option>{["Active", "Trial", "Suspended", "Deactivated"].map((s) => <option key={s}>{s}</option>)}</select>
          <span className="ml-auto text-xs text-ink-500">{list.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Company</th><th>Plan</th><th>Status</th><th className="text-right">Users</th><th className="text-right">Active jobs</th><th>Credits used</th><th>Registered</th><th /></tr></thead>
            <tbody>
              {list.map((t) => {
                const pct = Math.round((t.creditsUsed / t.creditsLimit) * 100);
                return (
                  <tr key={t.id}>
                    <td><div className="font-medium">{t.name}</div><div className="text-xs text-ink-500">{t.industry} · {t.city} · {t.email}</div></td>
                    <td><Badge>{t.plan}</Badge></td>
                    <td><Badge tone={tenantTone(t.status)}>{t.status}</Badge></td>
                    <td className="text-right tabular-nums">{t.users}</td>
                    <td className="text-right tabular-nums">{t.activeJobs}</td>
                    <td className="min-w-[140px]"><div className="mb-1 text-xs tabular-nums">{t.creditsUsed.toLocaleString("en-IN")} / {t.creditsLimit.toLocaleString("en-IN")}</div><Meter value={pct} tone={pct >= 100 ? "danger" : pct >= 80 ? "warn" : "brand"} /></td>
                    <td className="text-xs text-ink-500">{fmtDate(t.createdOn)}</td>
                    <td className="relative text-right">
                      <button className="btn btn-ghost btn-sm p-1.5" onClick={() => setMenu(menu === t.id ? null : t.id)} aria-label={`Actions for ${t.name}`}><MoreHorizontal size={16} /></button>
                      {menu === t.id && (<>
                        <div className="fixed inset-0 z-30" onClick={() => setMenu(null)} />
                        <div className="absolute right-4 z-40 mt-1 w-60 animate-slide-in overflow-hidden rounded-xl border border-ink-200 bg-white py-1 text-left text-sm shadow-pop">
                          <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => act(t, "Assign plan?", `Assign a different subscription plan to ${t.name}. Billing adjusts at the next renewal.`)}>Assign plan</button>
                          <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => act(t, "Extend trial or grace?", `Extend the trial or grace period for ${t.name} by 14 days.`)}>Extend trial / grace</button>
                          {t.status === "Suspended" || t.status === "Deactivated"
                            ? <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => act(t, "Reactivate company?", `Users of ${t.name} regain access immediately.`, "Active")}>Reactivate</button>
                            : <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => act(t, "Suspend company?", `Users of ${t.name} can't sign in while suspended. Data is kept.`, "Suspended")}>Suspend</button>}
                          <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => act(t, "Request support access?", `Needs approval from ${t.name}'s Company Admin. Time-limited to 2 hours and fully audited.`)}>Request support access</button>
                          <div className="my-1 border-t border-ink-100" />
                          <button className="block w-full px-4 py-2 text-left text-rose-700 hover:bg-rose-50" onClick={() => act(t, "Deactivate company?", "Stops all access and schedules data deletion per the retention policy after 30 days.", "Deactivated", true)}>Deactivate</button>
                        </div>
                      </>)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function AdminPlans() {
  const { toast, confirm } = useFeedback();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await confirm({ title: "Save plan changes?", message: "Price changes notify affected companies 30 days before they apply to renewals.", ok: "Save changes", reason: true })) toast("Plan changes saved and audited (prototype).");
  };
  return (
    <form onSubmit={submit}>
      <PageHeader title="Subscription plans" subtitle="Prices and limits are stored in the database. Changes apply to new subscriptions, and to renewals after notice." />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Plan</th><th>Monthly (₹)</th><th>Annual (₹)</th><th>Active jobs</th><th>Resume credits</th><th>Seats</th><th>Storage</th><th className="text-right">Subscribers</th></tr></thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.name}>
                  <td className="font-medium">{p.name}</td>
                  <td><input className="input w-28 py-1.5" type="number" defaultValue={p.monthly ?? undefined} placeholder="Custom" aria-label={`${p.name} monthly price`} /></td>
                  <td><input className="input w-32 py-1.5" type="number" defaultValue={p.annual ?? undefined} placeholder="Custom" aria-label={`${p.name} annual price`} /></td>
                  <td><input className="input w-24 py-1.5" defaultValue={p.jobs} aria-label={`${p.name} active jobs`} /></td>
                  <td><input className="input w-32 py-1.5" defaultValue={p.credits} aria-label={`${p.name} credits`} /></td>
                  <td><input className="input w-20 py-1.5" defaultValue={p.seats} aria-label={`${p.name} seats`} /></td>
                  <td><input className="input w-24 py-1.5" defaultValue={p.storage} aria-label={`${p.name} storage`} /></td>
                  <td className="text-right tabular-nums">{planSubscribers[p.name]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 bg-ink-50/70 px-5 py-3">
          <span className="text-xs text-ink-500">Values are prototype samples, not commercial prices.</span>
          <button className="btn btn-primary">Save changes</button>
        </div>
      </div>
    </form>
  );
}

export function AdminProcessing() {
  const { toast } = useFeedback();
  const statuses: ProcessingStatus[] = ["Queued", "Processing", "Completed", "NeedsReview", "Failed"];
  return (
    <>
      <PageHeader title="AI processing" subtitle="Resume-processing jobs across tenants. Only job metadata is shown, never file contents or candidate names."
        actions={<button className="btn btn-secondary" onClick={() => toast("Health check passed: model loaded, 2 workers, 41 ms embedding latency (prototype).", "info")}><HeartPulse size={15} /> Run health check</button>} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {statuses.map((s) => <div key={s} className="card p-4"><Badge tone={processingTone(s)}>{processingLabel(s)}</Badge><div className="mt-2 font-display text-2xl font-bold tabular-nums">{processingJobs.filter((j) => j.status === s).length}</div></div>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <section className="card overflow-hidden xl:col-span-8">
          <div className="card-head"><h2 className="card-title">Recent jobs</h2></div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Job ID</th><th>Tenant</th><th>Type</th><th>Status</th><th className="text-right">Attempts</th><th className="text-right">Duration</th><th>Queued</th><th /></tr></thead>
              <tbody>
                {processingJobs.map((j) => (
                  <tr key={j.id}>
                    <td><code className="rounded bg-ink-100 px-1.5 text-xs">{j.id}</code></td>
                    <td className="text-sm">{j.company}</td>
                    <td className="text-sm">{j.fileType}</td>
                    <td><Badge tone={processingTone(j.status)}>{processingLabel(j.status)}</Badge>{"error" in j && <div className="mt-1 text-xs text-ink-500">{j.error}</div>}</td>
                    <td className="text-right tabular-nums">{j.attempts}</td>
                    <td className="text-right text-sm tabular-nums">{j.durationMs ? `${(j.durationMs / 1000).toFixed(1)} s` : "—"}</td>
                    <td className="text-xs text-ink-500">{ago(j.queuedOn)}</td>
                    <td>{j.status === "Failed" && <button className="btn btn-secondary btn-sm" onClick={() => toast("Retry queued. Duplicate processing is prevented.", "info")}>Retry</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card p-5 xl:col-span-4">
          <h2 className="mb-3 font-semibold">Model configuration</h2>
          <dl className="space-y-2 text-sm">
            {[["Embedding model", "sentence-transformers/all-MiniLM-L6-v2"], ["PDF extraction", "PyMuPDF"], ["DOCX extraction", "python-docx"], ["OCR", "Disabled (Tesseract not installed)"], ["Timeout", "30 s · 3 retries with backoff"], ["Max file size", "5 MB"], ["External AI provider", "Disabled"], ["Fallback mode", "Keyword-dictionary matching if the model is unavailable"]].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[130px_1fr] gap-3"><dt className="text-ink-500">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}

export function AdminAudit() {
  const { toast } = useFeedback();
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("");
  const list = auditLog.filter((e) => (!q || `${e.action} ${e.actor} ${e.company} ${e.ip} ${e.target}`.toLowerCase().includes(q.toLowerCase())) && (!sev || e.severity === sev));
  return (
    <>
      <PageHeader title="Security & audit log" subtitle="Append-only record of sensitive actions across the platform. Entries can't be edited or deleted."
        actions={<button className="btn btn-secondary" onClick={() => toast("Audit export queued (prototype).", "info")}><FileText size={15} /> Export</button>} />
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input className="input pl-9" placeholder="Search action, actor, company, IP" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search audit log" /></div>
          <select className="input w-auto" value={sev} onChange={(e) => setSev(e.target.value)} aria-label="Severity"><option value="">All severities</option><option>Info</option><option>Warning</option><option>High</option></select>
          <span className="ml-auto text-xs text-ink-500">{list.length} events</span>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Time</th><th>Severity</th><th>Action</th><th>Target</th><th>Company</th><th>Actor</th><th>IP</th></tr></thead>
            <tbody>
              {list.map((e, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap text-xs text-ink-500">{fmtDateTime(e.on)}</td>
                  <td><Badge tone={severityTone(e.severity)}>{e.severity}</Badge></td>
                  <td className="text-sm font-medium">{e.action}</td>
                  <td className="text-sm">{e.target}</td>
                  <td className="text-sm">{e.company}</td>
                  <td className="text-xs text-ink-500">{e.actor}</td>
                  <td><code className="text-xs text-ink-500">{e.ip}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function AdminSystem() {
  const { toast } = useFeedback();
  const field = (id: string, label: string, value: string | number, type = "number") => (
    <div><label className="label" htmlFor={id}>{label}</label><input id={id} className="input" type={type} defaultValue={value} /></div>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); toast("System settings saved and audited (prototype)."); }}>
      <PageHeader title="System settings" subtitle="Platform-wide defaults. Secrets like connection strings and API keys come from environment variables and are never shown here." />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-3 font-semibold">Security</h2><div className="grid gap-4 md:grid-cols-2">{field("s1", "Lockout after failed logins", 5)}{field("s2", "Lockout duration (min)", 15)}{field("s3", "Session timeout (min)", 60)}{field("s4", "Minimum password length", 10)}</div></section>
        <section className="card p-5"><h2 className="mb-3 font-semibold">Uploads &amp; processing</h2><div className="grid gap-4 md:grid-cols-2">{field("u1", "Max resume size (MB)", 5)}{field("u2", "Allowed types", "PDF, DOCX", "text")}{field("u3", "AI request timeout (s)", 30)}{field("u4", "Max retries", 3)}</div></section>
        <section className="card p-5"><h2 className="mb-3 font-semibold">Billing</h2><div className="grid gap-4 md:grid-cols-2">{field("b1", "Grace period (days)", 7)}{field("b2", "Trial length (days)", 14)}
          <div className="md:col-span-2"><label className="label" htmlFor="b3">Payment provider</label><select id="b3" className="input"><option>Demo mode (no gateway)</option><option disabled>Razorpay (credentials required)</option><option disabled>Cashfree (credentials required)</option></select></div></div></section>
        <section className="card p-5"><h2 className="mb-3 font-semibold">Data retention defaults</h2><div className="grid gap-4 md:grid-cols-2">
          <div><label className="label" htmlFor="r1">Candidate retention</label><select id="r1" className="input" defaultValue="12"><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option></select></div>
          <div><label className="label" htmlFor="r2">Audit log retention</label><select id="r2" className="input" defaultValue="3"><option value="1">1 year</option><option value="3">3 years</option><option value="7">7 years</option></select></div></div></section>
      </div>
      <div className="mt-4 flex justify-end"><button className="btn btn-primary">Save system settings</button></div>
    </form>
  );
}
