import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { TODAY, departments, interviews, jobs, offers, subscription } from "../data/seed";
import { awaitsReview, funnel, reached, useStore } from "../data/store";
import { BarChart, DonutChart, Legend, ORDINAL, SERIES } from "../components/charts";
import { Badge, Callout, Dl, Meter, PageHeader } from "../components/ui";
import { jobTone } from "../lib/ui";

export default function Analytics() {
  const { applications } = useStore();
  const [days, setDays] = useState(90);
  const [dept, setDept] = useState("");

  const apps = useMemo(() => applications.filter((a) => a.appliedOn >= new Date(TODAY.getTime() - days * 864e5) && (!dept || a.job.department === dept)), [applications, days, dept]);
  const scopedJobs = jobs.filter((j) => !dept || j.department === dept);
  const depts = departments.filter((d) => jobs.some((j) => j.department === d));
  const f = funnel(apps);
  const maxF = Math.max(1, f[0].count);
  const screened = apps.filter((a) => a.screening).length;
  const hires = apps.filter((a) => a.stage === "Hired");
  const tth = hires.map((a) => Math.round((+(a.history.find((h) => h.title === "Hired")?.on ?? TODAY) - +a.appliedOn) / 864e5)).sort((a, b) => a - b);
  const sources = Object.entries(apps.reduce<Record<string, number>>((m, a) => ((m[a.source] = (m[a.source] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
  const failed = apps.filter((a) => a.processing === "Failed").length;
  const small = apps.length < 30;

  const kpis: [string, string, string][] = [
    ["Applications", `${apps.length}`, "Applications submitted in the period"],
    ["Screening completion", apps.length ? `${Math.round((screened / apps.length) * 100)}%` : "—", `${screened} of ${apps.length} resumes processed with a score`],
    ["Awaiting review", `${apps.filter(awaitsReview).length}`, "Processed, still New, no recruiter decision"],
    ["Interviews", `${interviews.filter((i) => apps.some((a) => a.id === i.applicationId) && i.status !== "Cancelled").length}`, "Scheduled or held, excluding cancelled"],
    ["Offers made", `${offers.filter((o) => apps.some((a) => a.id === o.applicationId) && o.status !== "Draft").length}`, "Offers sent (drafts excluded)"],
    ["Time to hire", tth.length ? `${tth[Math.floor(tth.length / 2)]} days` : "—", tth.length < 5 ? `Median, applied → hired. Only ${tth.length} hire(s), so not representative` : "Median days from application to hire"],
  ];

  return (
    <>
      <PageHeader title="Recruitment analytics" subtitle="Applications received in the selected period, across jobs you're permitted to see."
        actions={<>
          <select className="input w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Date range"><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last 12 months</option></select>
          <select className="input w-auto" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department"><option value="">All departments</option>{depts.map((d) => <option key={d}>{d}</option>)}</select>
        </>} />

      {small && <Callout icon={<Info size={16} />} className="mb-4"><strong>Small sample ({apps.length} applications).</strong> Counts are exact, but percentages and averages can swing a lot with a single candidate. Read trends with caution.</Callout>}

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map(([l, v, d]) => (
          <div key={l} className="card p-4" title={d}>
            <div className="text-[0.8rem] font-medium text-ink-500">{l}</div>
            <div className="mt-1 font-display text-2xl font-bold tabular-nums">{v}</div>
            <div className="truncate text-xs text-ink-500">{d}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-12">
        <section className="card lg:col-span-5">
          <div className="card-head"><div><h2 className="card-title">Funnel</h2><div className="card-sub">Applications that reached each stage</div></div></div>
          <div className="space-y-2.5 p-5">
            {f.map((s, i) => (
              <div key={s.label} className="grid grid-cols-[96px_1fr_36px] items-center gap-3 text-sm">
                <span className="text-ink-500">{s.label}</span>
                <div className="h-6 overflow-hidden rounded-md bg-ink-100"><div className="h-full rounded-md" style={{ width: `${(s.count / maxF) * 100}%`, background: ORDINAL[i] }} /></div>
                <span className="text-right font-semibold tabular-nums">{s.count}</span>
              </div>
            ))}
            <p className="pt-2 text-xs text-ink-500">Stage-to-stage conversion percentages appear once there are at least 30 applications in the period.</p>
          </div>
        </section>
        <section className="card lg:col-span-7">
          <div className="card-head"><div><h2 className="card-title">Applications per job</h2><div className="card-sub">In the selected period</div></div></div>
          <div className="p-5"><BarChart horizontal labels={scopedJobs.map((j) => j.title)} series={[{ label: "Applications", data: scopedJobs.map((j) => apps.filter((a) => a.jobId === j.id).length), color: "#7c55f8" }]} /></div>
        </section>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-12">
        <section className="card lg:col-span-7">
          <div className="card-head">
            <div><h2 className="card-title">Activity by department</h2><div className="card-sub">Applications, and how many reached interview and offer</div></div>
            <Legend items={["Applications", "Interviews", "Offers"].map((l, i) => ({ label: l, color: SERIES[i] }))} />
          </div>
          <div className="p-5">
            <BarChart labels={depts} series={[
              { label: "Applications", data: depts.map((d) => apps.filter((a) => a.job.department === d).length) },
              { label: "Interviews", data: depts.map((d) => apps.filter((a) => a.job.department === d && reached(a, "Interview")).length) },
              { label: "Offers", data: depts.map((d) => apps.filter((a) => a.job.department === d && reached(a, "Offer")).length) },
            ]} />
          </div>
        </section>
        <section className="card lg:col-span-5">
          <div className="card-head"><div><h2 className="card-title">Application sources</h2><div className="card-sub">Where candidates applied from</div></div></div>
          <div className="flex flex-wrap items-center gap-5 p-5">
            <DonutChart labels={sources.map((s) => s[0])} data={sources.map((s) => s[1])} />
            <ul className="min-w-[160px] flex-1 text-sm">
              {sources.map(([s, n], i) => (
                <li key={s} className="flex justify-between border-b border-ink-100 py-1.5 last:border-0"><span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERIES[i] }} />{s}</span><span className="font-medium tabular-nums">{n}</span></li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card overflow-hidden lg:col-span-7">
          <div className="card-head"><h2 className="card-title">By job</h2></div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Job</th><th>Status</th><th className="text-right">Applicants</th><th className="text-right">Avg. match</th><th className="text-right">Shortlisted</th><th className="text-right">Interviewed</th></tr></thead>
              <tbody>
                {scopedJobs.map((j) => {
                  const ja = apps.filter((a) => a.jobId === j.id);
                  const sc = ja.filter((a) => a.screening);
                  return (
                    <tr key={j.id}>
                      <td className="font-medium">{j.title}<div className="text-xs font-normal text-ink-500">{j.department}</div></td>
                      <td><Badge tone={jobTone(j.status)}>{j.status}</Badge></td>
                      <td className="text-right tabular-nums">{ja.length}</td>
                      <td className="text-right tabular-nums">{sc.length ? Math.round(sc.reduce((s, a) => s + a.screening!.score, 0) / sc.length) : "—"}</td>
                      <td className="text-right tabular-nums">{ja.filter((a) => reached(a, "Shortlisted")).length}</td>
                      <td className="text-right tabular-nums">{ja.filter((a) => reached(a, "Interview")).length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card lg:col-span-5">
          <div className="card-head"><div><h2 className="card-title">AI usage &amp; cost</h2><div className="card-sub">This billing period</div></div></div>
          <div className="p-5">
            <div className="mb-1.5 flex justify-between text-sm"><span>Resume-processing credits</span><span className="font-medium tabular-nums">{subscription.usage[1].used} / {subscription.usage[1].limit}</span></div>
            <Meter tone="ai" value={(subscription.usage[1].used / subscription.usage[1].limit) * 100} className="mb-4" />
            <Dl items={[["Inference", "Local · all-MiniLM-L6-v2"], ["External AI API spend", "₹0.00 (no external provider)"], ["Avg. processing time", "2.3 s per resume"], ["Failure rate", apps.length ? `${Math.round((failed / apps.length) * 100)}% (${failed} failed)` : "—"]]} />
          </div>
        </section>
      </div>
    </>
  );
}
