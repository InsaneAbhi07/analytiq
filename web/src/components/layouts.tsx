import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  BarChart3, Bell, Briefcase, CalendarDays, ChevronDown, CreditCard, ExternalLink, Globe2, LayoutDashboard, LogOut, Menu, Plus, Search, Sparkles, Users, X,
} from "lucide-react";
import { company, currentUser, interviews, jobs, subscription } from "../data/seed";
import { awaitsReview, useStore } from "../data/store";
import { Avatar } from "./ui";

export function Logo({ dark = false, sub }: { dark?: boolean; sub?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-ai-500 shadow-sm">
        <svg viewBox="0 0 32 32" className="h-5 w-5"><path d="M9 23 L16 8 L23 23 M12 18 H20" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="leading-tight">
        <span className={clsx("block font-display text-[1.05rem] font-bold tracking-tight", dark ? "text-white" : "text-ink-900")}>Analytiq</span>
        {sub && <span className={clsx("block text-[0.68rem]", dark ? "text-ink-400" : "text-ink-500")}>{sub}</span>}
      </span>
    </span>
  );
}

const ProtoChip = () => (
  <span className="hidden whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[0.7rem] font-semibold text-amber-700 sm:inline" title="UI prototype: data is mock and resets on reload.">
    Prototype · mock data
  </span>
);

/** Recruiter / Company Admin workspace. */
export function AppShell() {
  const { applications } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => setOpen(false), [location.pathname]);

  const nav = [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/app/jobs", label: "Jobs", icon: Briefcase, count: jobs.filter((j) => j.status === "Published").length },
    { to: "/app/candidates", label: "Candidates", icon: Users, count: applications.filter(awaitsReview).length },
    { to: "/app/interviews", label: "Interviews", icon: CalendarDays, count: interviews.filter((i) => i.status === "Scheduled").length },
    { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/app/billing", label: "Billing & usage", icon: CreditCard, section: "Company" },
  ];

  return (
    <div className="min-h-screen">
      <aside className={clsx("fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink-950 text-ink-300 transition-transform lg:translate-x-0 lg:transition-none", open ? "translate-x-0 shadow-pop" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Link to="/app"><Logo dark sub="Recruitment workspace" /></Link>
          <button className="text-ink-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <div className="mx-3 mb-3 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 text-xs font-bold text-white">{company.short}</span>
          <div className="min-w-0 text-[0.8rem]">
            <div className="truncate font-medium text-white">{company.name}</div>
            <div className="text-[0.7rem] text-ink-400">{subscription.plan} plan · {company.city}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3">
          {nav.map((n) => (
            <div key={n.to}>
              {n.section && <div className="px-3 pb-1.5 pt-5 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-ink-500">{n.section}</div>}
              <NavLink to={n.to} end={n.end}
                className={({ isActive }) => clsx("mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-gradient-to-r from-brand-600/90 to-brand-600/40 text-white" : "hover:bg-white/5 hover:text-white")}>
                <n.icon size={17} />
                {n.label}
                {n.count != null && <span className="ml-auto rounded-full bg-white/10 px-2 text-[0.7rem] text-ink-200">{n.count}</span>}
              </NavLink>
            </div>
          ))}
          <div className="px-3 pb-1.5 pt-5 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-ink-500">Public</div>
          <Link to="/careers" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/5 hover:text-white">
            <Globe2 size={17} /> Careers page <ExternalLink size={13} className="ml-auto" />
          </Link>
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-xs">
          <div className="flex items-center gap-2 text-ink-200"><span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" /> AI service online · local model</div>
          <div className="mt-1 text-ink-500">all-MiniLM-L6-v2 · no external API</div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-200/70 bg-white/85 px-4 backdrop-blur md:px-6">
          <button className="btn btn-ghost p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <form className="relative hidden max-w-sm flex-1 md:block" onSubmit={(e) => { e.preventDefault(); navigate(`/app/candidates?q=${encodeURIComponent(q)}`); }} role="search">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input bg-ink-50 pl-9" placeholder="Search candidates, skills, jobs…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search candidates" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <ProtoChip />
            <Link to="/app/jobs/new" className="btn btn-primary btn-sm hidden sm:inline-flex"><Plus size={16} /> New job</Link>
            <Dropdown button={<span className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-ink-100"><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" /></span>} label="Notifications">
              <div className="w-80">
                <div className="border-b border-ink-100 px-4 py-2.5 text-sm font-semibold">Notifications</div>
                {[
                  ["/app/candidates/14", "Resume processing failed for Meera Pillai", "Product Designer · needs manual review"],
                  ["/app/interviews", "Interview today 4:00 PM — Neha Gupta", "Data Scientist — NLP · Round 1"],
                  ["/app/candidates/7", "Offer to Ishita Banerjee awaiting response", "Sent 2 days ago"],
                ].map(([to, t, s]) => (
                  <Link key={to} to={to} className="block border-b border-ink-100 px-4 py-2.5 last:border-0 hover:bg-ink-50">
                    <div className="text-sm font-medium">{t}</div><div className="text-xs text-ink-500">{s}</div>
                  </Link>
                ))}
              </div>
            </Dropdown>
            <Dropdown label="Account" button={
              <span className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink-100">
                <Avatar name={currentUser.name} initials={currentUser.initials} />
                <span className="hidden text-left leading-tight md:block"><span className="block text-sm font-medium">{currentUser.name}</span><span className="block text-[0.7rem] text-ink-500">{currentUser.role}</span></span>
                <ChevronDown size={15} className="text-ink-400" />
              </span>}>
              <div className="w-56 py-1 text-sm">
                <Link to="/app/billing" className="flex items-center gap-2 px-4 py-2 hover:bg-ink-50"><CreditCard size={15} /> Billing &amp; usage</Link>
                <Link to="/careers" className="flex items-center gap-2 px-4 py-2 hover:bg-ink-50"><Globe2 size={15} /> View as candidate</Link>
                <div className="my-1 border-t border-ink-100" />
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 hover:bg-ink-50"><LogOut size={15} /> Sign out</Link>
              </div>
            </Dropdown>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Dropdown({ button, children, label }: { button: ReactNode; children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={label}>{button}</button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 animate-slide-in overflow-hidden rounded-xl border border-ink-200 bg-white shadow-pop">{children}</div>
        </>
      )}
    </div>
  );
}

/** Marketing site + a company's public careers portal. */
export function PublicLayout({ careers = false }: { careers?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          {careers ? (
            <>
              <Link to="/careers" className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 text-xs font-bold text-white">{company.short}</span>
                <span className="min-w-0 leading-tight"><span className="block max-w-[40vw] truncate font-semibold sm:max-w-none">{company.name}</span><span className="block text-[0.7rem] text-ink-500">Careers</span></span>
              </Link>
              <nav className="ml-auto flex gap-1 text-sm">
                <Link to="/careers" className="btn btn-ghost btn-sm">Open roles</Link>
                <Link to="/careers/status" className="btn btn-ghost btn-sm">Track application</Link>
              </nav>
            </>
          ) : (
            <>
              <Link to="/"><Logo sub="AI-assisted hiring" /></Link>
              <nav className="ml-auto hidden gap-1 md:flex">
                <a href="#features" className="btn btn-ghost btn-sm">Features</a>
                <a href="#responsible-ai" className="btn btn-ghost btn-sm">Responsible AI</a>
                <a href="#pricing" className="btn btn-ghost btn-sm">Pricing</a>
                <Link to="/careers" className="btn btn-ghost btn-sm">Sample careers page</Link>
              </nav>
              <div className="ml-auto flex gap-2 md:ml-2">
                <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Start free trial</Link>
              </div>
            </>
          )}
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-ink-100 bg-ink-50 py-6 text-xs text-ink-500">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4">
          {careers
            ? <span>© {new Date().getFullYear()} {company.name} · Powered by <Link className="text-brand-700" to="/">Analytiq</Link></span>
            : <span>© {new Date().getFullYear()} Analytiq · Built by Abhishek Singh</span>}
          <ProtoChip />
        </div>
      </footer>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-12 text-ink-300 lg:flex">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-ai-500/25 blur-3xl" />
        <Link to="/" className="relative"><Logo dark sub="AI-assisted hiring" /></Link>
        <div className="relative">
          <h2 className="max-w-md text-[2rem] font-bold leading-tight text-white">Screen applicants faster, and still make every decision yourself.</h2>
          <ul className="mt-6 max-w-md space-y-3 text-[0.92rem]">
            {["Explainable match scores that show the resume evidence behind every skill.",
              "No automatic rejections. Every stage change records who made it and why.",
              "Local open-source models, so resumes aren't sent to third-party AI APIs.",
              "Each company's data is isolated from every other company."].map((t) => (
              <li key={t} className="flex gap-3"><Sparkles size={18} className="mt-0.5 shrink-0 text-ai-500" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-ink-500">UI prototype · all data shown is mock</div>
      </aside>
      <main className="flex items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md"><Outlet /></div>
      </main>
    </div>
  );
}
