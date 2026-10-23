import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { jobs, subscription } from "../data/seed";
import { reached, useStore } from "../data/store";
import { Badge, EmptyState, PageHeader } from "../components/ui";
import { fmtDate, jobTone } from "../lib/ui";
import type { JobStatus } from "../data/types";

export default function Jobs() {
  const { applications } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<JobStatus | "">("");
  const [dept, setDept] = useState("");

  const rows = useMemo(() => jobs.filter((j) =>
    (!q || `${j.title} ${j.department} ${j.location} ${j.required.join(" ")}`.toLowerCase().includes(q.toLowerCase())) &&
    (!status || j.status === status) && (!dept || j.department === dept)), [q, status, dept]);

  const limit = subscription.usage[0];
  return (
    <>
      <PageHeader title="Jobs" subtitle={`${jobs.length} jobs · ${limit.used} of ${limit.limit} active postings used on the ${subscription.plan} plan`}
        actions={<Link to="/app/jobs/new" className="btn btn-primary"><Plus size={16} /> Create job</Link>} />
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" placeholder="Search title, skill or department" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search jobs" />
          </div>
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value as JobStatus | "")} aria-label="Status">
            <option value="">All statuses</option>{["Published", "Draft", "Paused", "Closed"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="input w-auto" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
            <option value="">All departments</option>{[...new Set(jobs.map((j) => j.department))].map((d) => <option key={d}>{d}</option>)}
          </select>
          <span className="ml-auto text-xs text-ink-500">{rows.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Job</th><th>Status</th><th className="text-right">Applicants</th><th className="text-right">Shortlisted</th><th>Recruiter</th><th>Deadline</th></tr></thead>
            <tbody>
              {rows.map((j) => {
                const ja = applications.filter((a) => a.jobId === j.id);
                return (
                  <tr key={j.id}>
                    <td><Link to={`/app/jobs/${j.id}`} className="font-medium hover:text-brand-700">{j.title}</Link><div className="text-xs text-ink-500">{j.department} · {j.location} · {j.workMode} · {j.employmentType}</div></td>
                    <td><Badge tone={jobTone(j.status)}>{j.status}</Badge></td>
                    <td className="text-right tabular-nums">{ja.length}</td>
                    <td className="text-right tabular-nums">{ja.filter((a) => reached(a, "Shortlisted")).length}</td>
                    <td className="text-sm">{j.recruiter}</td>
                    <td className="text-xs text-ink-500">{fmtDate(j.deadline)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <EmptyState icon={<Search size={20} />} title="No jobs match these filters" />}
        </div>
      </div>
    </>
  );
}
