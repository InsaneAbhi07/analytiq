import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import { ExternalLink, Link2, Sparkles, Users } from "lucide-react";
import { company, jobs } from "../data/seed";
import { useStore } from "../data/store";
import { SEMANTIC_CREDIT, SEMANTIC_THRESHOLD, WEIGHTS } from "../data/scoring";
import { useFeedback } from "../components/feedback";
import { Badge, Callout, Dl, EmptyState, PageHeader, ScoreRing } from "../components/ui";
import { ago, fmtDate, jobTone, processingLabel, processingTone, stageLabel, stageTone } from "../lib/ui";
import type { Stage } from "../data/types";
import NotFound from "./NotFound";

const COLUMNS: [string, Stage[]][] = [
  ["New", ["New", "Screening"]],
  ["Shortlisted", ["Shortlisted", "OnHold", "InfoRequested"]],
  ["Interview", ["Interview"]],
  ["Offer / Hired", ["Offer", "Hired"]],
  ["Closed", ["Rejected", "Withdrawn"]],
];

export default function JobDetails() {
  const { id } = useParams();
  const job = jobs.find((j) => j.id === Number(id));
  const { applications } = useStore();
  const { toast } = useFeedback();
  const [tab, setTab] = useState<"pipeline" | "details" | "criteria">("pipeline");
  if (!job) return <NotFound />;
  const apps = applications.filter((a) => a.jobId === job.id).sort((a, b) => (b.screening?.score ?? -1) - (a.screening?.score ?? -1));

  return (
    <>
      <PageHeader
        crumbs={<><Link to="/app/jobs" className="hover:text-brand-700">Jobs</Link> / {job.title}</>}
        title={<span className="flex flex-wrap items-center gap-2">{job.title} <Badge tone={jobTone(job.status)}>{job.status}</Badge></span>}
        subtitle={`${job.department} · ${job.location} · ${job.workMode} · ${job.openings} opening(s) · closes ${fmtDate(job.deadline)}`}
        actions={<>
          {job.status === "Published" && <>
            <Link to={`/careers/jobs/${job.id}`} target="_blank" className="btn btn-secondary"><ExternalLink size={15} /> Public page</Link>
            <button className="btn btn-secondary" onClick={() => toast(`Link copied: careers.analytiq.app/${company.slug}/jobs/${job.id}`)}><Link2 size={15} /> Copy link</button>
          </>}
          <Link to={`/app/candidates?job=${job.id}`} className="btn btn-primary"><Users size={15} /> Screen applicants</Link>
        </>}
      />

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-ink-200" role="tablist">
        {([["pipeline", `Pipeline (${apps.length})`], ["details", "Job details"], ["criteria", "Screening criteria"]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={clsx("whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium", tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900")}>{l}</button>
        ))}
      </div>

      {tab === "pipeline" && (apps.length === 0
        ? <div className="card"><EmptyState icon={<Users size={20} />} title="No applications yet">{job.status === "Draft" ? "Publish this job to start receiving applications." : "Share the application link to start receiving applications."}</EmptyState></div>
        : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {COLUMNS.map(([title, stages]) => {
              const col = apps.filter((a) => stages.includes(a.stage));
              return (
                <div key={title} className="w-64 shrink-0 rounded-xl bg-ink-100/60 p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1"><span className="text-sm font-semibold">{title}</span><Badge>{col.length}</Badge></div>
                  {col.map((a) => (
                    <Link key={a.id} to={`/app/candidates/${a.id}`} className="card mb-2 block p-3 transition hover:shadow-pop">
                      <div className="flex items-center gap-2.5">
                        <ScoreRing score={a.screening?.score} />
                        <div className="min-w-0"><div className="truncate font-medium">{a.candidate.name}</div><div className="text-xs text-ink-500">{ago(a.appliedOn)}</div></div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge tone={stageTone(a.stage)}>{stageLabel(a.stage)}</Badge>
                        {a.processing !== "Completed" && <Badge tone={processingTone(a.processing)}>{processingLabel(a.processing)}</Badge>}
                      </div>
                    </Link>
                  ))}
                  {col.length === 0 && <div className="rounded-lg border border-dashed border-ink-300 p-3 text-center text-xs text-ink-400">None</div>}
                </div>
              );
            })}
          </div>
        ))}

      {tab === "details" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-6 text-[0.93rem] leading-relaxed text-ink-700 lg:col-span-2">
            <h2 className="mb-2 text-base font-semibold">About the role</h2><p>{job.summary}</p>
            <h2 className="mb-2 mt-5 text-base font-semibold">Responsibilities</h2>
            <ul className="list-disc space-y-1 pl-5">{job.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
            <h2 className="mb-2 mt-5 text-base font-semibold">Education</h2><p>{job.education}</p>
          </div>
          <div className="card p-5">
            <Dl items={[["Hiring manager", job.hiringManager], ["Recruiter", job.recruiter], ["Experience", `${job.minExp}–${job.maxExp} years`], ["Salary range", job.salary], ["Openings", job.openings], ["Created", fmtDate(job.createdOn)], ["Deadline", fmtDate(job.deadline)]]} />
          </div>
        </div>
      )}

      {tab === "criteria" && (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="card p-5 lg:col-span-7">
            <h2 className="mb-3 text-base font-semibold">Skills used for matching</h2>
            <div className="mb-1.5 text-sm font-semibold">Required <span className="font-normal text-ink-500">· {WEIGHTS.required}% of score</span></div>
            <div className="mb-4 flex flex-wrap gap-1.5">{job.required.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            <div className="mb-1.5 text-sm font-semibold">Preferred <span className="font-normal text-ink-500">· {WEIGHTS.preferred}% of score</span></div>
            <div className="mb-4 flex flex-wrap gap-1.5">{job.preferred.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            <div className="mb-1 text-sm font-semibold">Experience <span className="font-normal text-ink-500">· {WEIGHTS.experience}% of score</span></div>
            <p className="text-sm text-ink-600">{job.minExp}–{job.maxExp} years. Pro-rated below the minimum, and not penalised above the maximum.</p>
          </div>
          <div className="space-y-3 lg:col-span-5">
            <Callout tone="ai" icon={<Sparkles size={16} />}>
              <strong>How matching works.</strong> Exact skill matches get full credit. Related skills found by the local embedding model (similarity ≥ {SEMANTIC_THRESHOLD.toFixed(2)}) get {SEMANTIC_CREDIT * 100}% credit and are flagged for you to verify. Criteria that can't be extracted reliably are excluded, not guessed.
            </Callout>
            <Callout>Scores are a sorting aid, not a decision. Name, photo, gender, age, religion, caste and location are never used in scoring.</Callout>
          </div>
        </div>
      )}
    </>
  );
}
