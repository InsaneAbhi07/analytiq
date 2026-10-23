import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check } from "lucide-react";
import { useStore } from "../data/store";
import { Avatar, Badge, PageHeader, ScoreRing } from "../components/ui";
import { initials, stageLabel, stageTone } from "../lib/ui";
import type { ReactNode } from "react";

export default function Compare() {
  const { applications } = useStore();
  const [p] = useSearchParams();
  let list = (p.get("ids") ?? "").split(",").map(Number).map((id) => applications.find((a) => a.id === id)).filter((a) => a != null).slice(0, 4);
  if (list.length < 2) list = applications.filter((a) => a.jobId === 1 && a.screening).sort((a, b) => b.screening!.score - a.screening!.score).slice(0, 3);
  const job = list[0].job;
  const sameJob = list.every((a) => a.jobId === job.id);
  const skills = sameJob ? [...job.required, ...job.preferred] : [];

  const Row = ({ label, cells }: { label: ReactNode; cells: ReactNode[] }) => (
    <>
      <div className="border-b border-ink-100 bg-ink-50/70 px-4 py-3 text-xs font-medium text-ink-500">{label}</div>
      {cells.map((c, i) => <div key={i} className="border-b border-ink-100 px-4 py-3 text-sm">{c}</div>)}
    </>
  );

  return (
    <>
      <PageHeader crumbs={<><Link to="/app/candidates" className="hover:text-brand-700">Candidates</Link> / Compare</>} title="Compare candidates"
        subtitle={sameJob ? `${list.length} applicants for ${job.title}` : "Candidates from different jobs. Skill rows are hidden because the criteria differ."}
        actions={<Link to="/app/candidates" className="btn btn-secondary"><ArrowLeft size={15} /> Back</Link>} />
      <div className="card overflow-x-auto">
        <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `170px repeat(${list.length}, minmax(200px, 1fr))` }}>
          <Row label="" cells={list.map((a) => (
            <div className="flex items-center gap-2.5"><Avatar name={a.candidate.name} initials={initials(a.candidate.name)} /><div><Link to={`/app/candidates/${a.id}`} className="font-medium hover:text-brand-700">{a.candidate.name}</Link><div className="text-xs text-ink-500">{a.candidate.headline}</div></div></div>
          ))} />
          <Row label="Match score" cells={list.map((a) => <ScoreRing score={a.screening?.score} />)} />
          <Row label="Stage" cells={list.map((a) => <Badge tone={stageTone(a.stage)}>{stageLabel(a.stage)}</Badge>)} />
          <Row label="Experience" cells={list.map((a) => (a.candidate.experience != null ? `${a.candidate.experience} years` : "Unverified"))} />
          {skills.map((sk) => (
            <Row key={sk} label={<>{sk} <span className="font-normal">· {job.required.includes(sk) ? "required" : "preferred"}</span></>} cells={list.map((a) => {
              const m = a.screening && [...a.screening.requiredMatched, ...a.screening.preferredMatched].find((x) => x.skill === sk);
              if (!a.screening) return <span className="text-ink-400">Not screened</span>;
              if (!m) return <span className="chip chip-missing">No evidence</span>;
              return m.type === "Exact" ? <span className="chip chip-match"><Check size={12} /> Exact</span> : <span className="chip chip-semantic">Related: {m.term}</span>;
            })} />
          ))}
          <Row label="Education" cells={list.map((a) => a.candidate.education.join("; ") || "—")} />
          <Row label="Certifications" cells={list.map((a) => a.candidate.certifications.join("; ") || "—")} />
          <Row label="Data quality" cells={list.map((a) => (
            <div>{a.candidate.parsingConfidence != null ? `${a.candidate.parsingConfidence}% parsing confidence` : "—"}
              {(a.screening?.warnings.length ?? 0) > 0 && <div className="mt-1 flex items-center gap-1 text-xs text-amber-700"><AlertTriangle size={12} /> {a.screening!.warnings.length} warning(s)</div>}</div>
          ))} />
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-500">Only job-related criteria from the resume are shown. Verify skills marked “related” or “no evidence” before deciding.</p>
    </>
  );
}
