import { Link } from "react-router-dom";
import { Briefcase, CalendarDays, FileWarning, Hourglass, Inbox, MailCheck, Plus, UserCheck } from "lucide-react";
import { TODAY, currentUser, interviews, jobs, offers, subscription } from "../data/seed";
import { awaitsReview, funnel, reached, useStore } from "../data/store";
import { Avatar, Badge, Callout, EmptyState, Meter, PageHeader, ScoreRing } from "../components/ui";
import { BarChart, ORDINAL } from "../components/charts";
import { ago, daysUntil, fmtTime, initials, processingLabel, processingTone } from "../lib/ui";
import type { ProcessingStatus } from "../data/types";

export default function Dashboard() {
  const { applications: apps } = useStore();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const last30 = apps.filter((a) => a.appliedOn >= new Date(TODAY.getTime() - 30 * 864e5));
  const f = funnel(last30);
  const maxF = Math.max(1, f[0].count);

  // 8 weekly buckets ending today.
  const start = new Date(TODAY.getTime() - 55 * 864e5);
  const weeks = Array.from({ length: 8 }, (_, i) => new Date(start.getTime() + i * 7 * 864e5));
  const weekly = weeks.map((w) => apps.filter((a) => a.appliedOn >= w && a.appliedOn < new Date(w.getTime() + 7 * 864e5)).length);

  const upcoming = interviews.filter((i) => i.status === "Scheduled" && i.startsAt.getTime() > now.getTime() - 36e5).sort((a, b) => +a.startsAt - +b.startsAt);
  const attention = apps.filter((a) => awaitsReview(a) || a.stage === "InfoRequested").sort((a, b) => +b.appliedOn - +a.appliedOn).slice(0, 5);
  const proc = (["Queued", "Processing", "Completed", "NeedsReview", "Failed"] as ProcessingStatus[]).map((p) => [p, apps.filter((a) => a.processing === p).length] as const);
  const credits = subscription.usage[1];

  const kpis = [
    { label: "Open jobs", value: jobs.filter((j) => j.status === "Published").length, foot: "Published on careers page", icon: Briefcase, to: "/app/jobs", tint: "from-brand-500 to-brand-700" },
    { label: "Applications", value: last30.length, foot: "Last 30 days", icon: Inbox, to: "/app/candidates", tint: "from-sky-500 to-sky-700" },
    { label: "Awaiting review", value: apps.filter(awaitsReview).length, foot: "Processed, no decision yet", icon: Hourglass, to: "/app/candidates", tint: "from-amber-400 to-amber-600" },
    { label: "Interviews", value: upcoming.filter((i) => +i.startsAt - +now < 7 * 864e5).length, foot: "Next 7 days", icon: CalendarDays, to: "/app/interviews", tint: "from-fuchsia-500 to-fuchsia-700" },
    { label: "Offers out", value: offers.filter((o) => o.status === "Draft" || o.status === "Sent").length, foot: "Draft or awaiting reply", icon: MailCheck, to: "/app/candidates", tint: "from-ai-500 to-ai-700" },
    { label: "Hires", value: apps.filter((a) => a.stage === "Hired").length, foot: "Last 90 days", icon: UserCheck, to: "/app/analytics", tint: "from-emerald-500 to-emerald-700" },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting}, ${currentUser.name.split(" ")[0]}`}
        subtitle={`${TODAY.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · Here's where your hiring stands today.`}
        actions={<>
          <Link to="/app/candidates" className="btn btn-secondary">Review candidates</Link>
          <Link to="/app/jobs/new" className="btn btn-primary"><Plus size={16} /> Create job</Link>
        </>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-pop">
            <div className="flex items-start justify-between">
              <span className="text-[0.8rem] font-medium text-ink-500">{k.label}</span>
              <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br text-white ${k.tint}`}><k.icon size={16} /></span>
            </div>
            <div className="mt-1 font-display text-[1.7rem] font-bold tabular-nums">{k.value}</div>
            <div className="text-xs text-ink-500">{k.foot}</div>
          </Link>
        ))}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-12">
        <section className="card lg:col-span-7">
          <div className="card-head">
            <div><h2 className="card-title">Applications received</h2><div className="card-sub">Weekly, last 8 weeks · all jobs</div></div>
            <Link to="/app/analytics" className="text-sm font-medium text-brand-700 hover:underline">Analytics →</Link>
          </div>
          <div className="p-5">
            <BarChart labels={weeks.map((w) => w.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }))} series={[{ label: "Applications", data: weekly, color: "#7c55f8" }]} />
          </div>
        </section>
        <section className="card lg:col-span-5">
          <div className="card-head"><div><h2 className="card-title">Recruitment funnel</h2><div className="card-sub">Last 30 days, by furthest stage reached</div></div></div>
          <div className="space-y-2.5 p-5">
            {f.map((s, i) => (
              <div key={s.label} className="grid grid-cols-[96px_1fr_36px] items-center gap-3 text-sm">
                <span className="text-ink-500">{s.label}</span>
                <div className="h-6 overflow-hidden rounded-md bg-ink-100"><div className="h-full rounded-md" style={{ width: `${(s.count / maxF) * 100}%`, background: ORDINAL[i] }} /></div>
                <span className="text-right font-semibold tabular-nums">{s.count}</span>
              </div>
            ))}
            <Callout className="mt-4">Small sample ({f[0].count} applications). Conversion rates are hidden below 30 applications because they'd be misleading.</Callout>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-7">
          <section className="card">
            <div className="card-head"><div><h2 className="card-title">Needs your attention</h2><div className="card-sub">Processed applications without a decision, and failed resumes</div></div></div>
            {attention.length === 0 ? <EmptyState icon={<UserCheck size={20} />} title="You're all caught up" /> : (
              <ul>
                {attention.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 border-b border-ink-100 px-5 py-3 last:border-0">
                    <ScoreRing score={a.screening?.score} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/app/candidates/${a.id}`} className="font-medium hover:text-brand-700">{a.candidate.name}</Link>
                      <div className="truncate text-xs text-ink-500">{a.job.title} · applied {ago(a.appliedOn)}</div>
                    </div>
                    <Badge tone={a.stage === "InfoRequested" ? "warning" : processingTone(a.processing)} icon={a.processing === "Failed" ? <FileWarning size={12} /> : undefined}>
                      {a.stage === "InfoRequested" ? "Info requested" : processingLabel(a.processing)}
                    </Badge>
                    <Link to={`/app/candidates/${a.id}`} className="btn btn-secondary btn-sm">Review</Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card overflow-hidden">
            <div className="card-head"><h2 className="card-title">Open job pipelines</h2><Link to="/app/jobs" className="text-sm font-medium text-brand-700 hover:underline">All jobs</Link></div>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Job</th><th className="text-right">Applied</th><th className="text-right">Screened</th><th className="text-right">Shortlisted</th><th className="text-right">Interview</th><th>Closes</th></tr></thead>
                <tbody>
                  {jobs.filter((j) => j.status === "Published").map((j) => {
                    const ja = apps.filter((a) => a.jobId === j.id);
                    const d = daysUntil(j.deadline);
                    return (
                      <tr key={j.id}>
                        <td><Link to={`/app/jobs/${j.id}`} className="font-medium hover:text-brand-700">{j.title}</Link><div className="text-xs text-ink-500">{j.department} · {j.location}</div></td>
                        <td className="text-right tabular-nums">{ja.length}</td>
                        <td className="text-right tabular-nums">{ja.filter((a) => a.screening).length}</td>
                        <td className="text-right tabular-nums">{ja.filter((a) => reached(a, "Shortlisted")).length}</td>
                        <td className="text-right tabular-nums">{ja.filter((a) => reached(a, "Interview")).length}</td>
                        <td className={d < 14 ? "text-xs font-medium text-rose-600" : "text-xs text-ink-500"}>in {d} days</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-4 xl:col-span-5">
          <section className="card">
            <div className="card-head"><h2 className="card-title">Upcoming interviews</h2><Link to="/app/interviews" className="text-sm font-medium text-brand-700 hover:underline">All</Link></div>
            <ul>
              {upcoming.slice(0, 5).map((i) => {
                const a = apps.find((x) => x.id === i.applicationId)!;
                return (
                  <li key={i.id} className="flex items-center gap-3 border-b border-ink-100 px-5 py-3 last:border-0">
                    <div className="w-12 rounded-lg bg-brand-50 py-1 text-center">
                      <div className="text-[0.62rem] font-semibold uppercase text-brand-600">{i.startsAt.toLocaleDateString("en-IN", { weekday: "short" })}</div>
                      <div className="font-display text-lg font-bold leading-none text-brand-800">{i.startsAt.getDate()}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{a.candidate.name}</div>
                      <div className="truncate text-xs text-ink-500">{fmtTime(i.startsAt)} IST · R{i.round} {i.title} · {a.job.title}</div>
                    </div>
                    <Badge>{i.type}</Badge>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card">
            <div className="card-head"><div><h2 className="card-title">Resume processing</h2><div className="card-sub">Local AI service</div></div><Badge tone="success">Healthy</Badge></div>
            <div className="p-5">
              <div className="grid grid-cols-5 text-center">
                {proc.map(([p, n]) => (<div key={p}><div className="font-display text-xl font-bold tabular-nums">{n}</div><div className="text-[0.7rem] text-ink-500">{processingLabel(p)}</div></div>))}
              </div>
              <div className="mt-4 flex justify-between text-xs"><span className="text-ink-500">Resume credits this period</span><span className="font-medium tabular-nums">{credits.used} / {credits.limit}</span></div>
              <Meter className="mt-1.5" tone="ai" value={(credits.used / credits.limit) * 100} />
            </div>
          </section>

          <section className="card">
            <div className="card-head"><h2 className="card-title">Recent applications</h2></div>
            <ul>
              {[...apps].sort((a, b) => +b.appliedOn - +a.appliedOn).slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center gap-3 border-b border-ink-100 px-5 py-2.5 last:border-0">
                  <Avatar name={a.candidate.name} initials={initials(a.candidate.name)} />
                  <div className="min-w-0 flex-1"><Link to={`/app/candidates/${a.id}`} className="font-medium hover:text-brand-700">{a.candidate.name}</Link><div className="truncate text-xs text-ink-500">{a.job.title} · {a.source}</div></div>
                  <span className="text-xs text-ink-500">{ago(a.appliedOn)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
