import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUp, Download, PauseCircle, Search, Star, Upload, XCircle } from "lucide-react";
import { jobs } from "../data/seed";
import { awaitsReview, interviewsFor, useStore, type AppView } from "../data/store";
import { useFeedback } from "../components/feedback";
import { Avatar, Badge, EmptyState, Modal, PageHeader, ScoreRing } from "../components/ui";
import { STAGES, ago, initials, interviewLabel, interviewTone, processingLabel, processingTone, stageLabel, stageTone } from "../lib/ui";
import type { ProcessingStatus, Stage } from "../data/types";

type SortKey = "score" | "name" | "applied";

export default function Candidates() {
  const { applications, changeStage } = useStore();
  const { toast, confirm } = useFeedback();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [job, setJob] = useState(params.get("job") ?? "");
  const [stage, setStage] = useState("");
  const [proc, setProc] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "score", desc: true });
  const [selected, setSelected] = useState<number[]>([]);
  const [upload, setUpload] = useState(false);

  const rows = useMemo(() => {
    const r = applications.filter((a) =>
      (!q || `${a.candidate.name} ${a.candidate.email} ${a.job.title} ${a.candidate.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase())) &&
      (!job || a.jobId === Number(job)) && (!stage || a.stage === stage) && (!proc || a.processing === proc) &&
      (!minScore || (a.screening?.score ?? -1) >= Number(minScore)));
    const val = (a: AppView) => (sort.key === "score" ? a.screening?.score ?? -1 : sort.key === "name" ? a.candidate.name : +a.appliedOn);
    return r.sort((a, b) => { const x = val(a), y = val(b); const c = x < y ? -1 : x > y ? 1 : 0; return sort.desc ? -c : c; });
  }, [applications, q, job, stage, proc, minScore, sort]);

  const toggleSort = (key: SortKey) => setSort((s) => ({ key, desc: s.key === key ? !s.desc : true }));
  const SortIcon = ({ k }: { k: SortKey }) => (sort.key === k ? (sort.desc ? <ArrowDown size={12} /> : <ArrowUp size={12} />) : null);
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  const bulk = async (to: Stage, label: string, danger = false) => {
    const res = await confirm({
      title: `${label} ${selected.length} candidate(s)?`,
      message: danger ? "Rejection is a human decision, so record why. A low AI score on its own isn't a sufficient reason." : "Each change is logged with your name and the time.",
      ok: label, danger, reason: danger,
    });
    if (!res) return;
    selected.forEach((id) => changeStage(id, to, res.reason || undefined));
    toast(`${selected.length} candidate(s) moved to ${stageLabel(to)}.`);
    setSelected([]);
  };

  const reset = () => { setQ(""); setJob(""); setStage(""); setProc(""); setMinScore(""); };

  return (
    <>
      <PageHeader title="Candidates"
        subtitle={`${applications.length} applications · ${applications.filter(awaitsReview).length} awaiting review. Scores help you sort, but every decision is yours.`}
        actions={<>
          <button className="btn btn-secondary" onClick={() => toast("Export queued. You'll get a CSV of the rows you're allowed to see (prototype).", "info")}><Download size={15} /> Export</button>
          <button className="btn btn-primary" onClick={() => setUpload(true)}><Upload size={15} /> Upload resumes</button>
        </>} />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" placeholder="Search name, email or skill" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search candidates" />
          </div>
          <select className="input w-auto" value={job} onChange={(e) => setJob(e.target.value)} aria-label="Job"><option value="">All jobs</option>{jobs.filter((j) => applications.some((a) => a.jobId === j.id)).map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select>
          <select className="input w-auto" value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Stage"><option value="">All stages</option>{STAGES.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}</select>
          <select className="input w-auto" value={proc} onChange={(e) => setProc(e.target.value)} aria-label="Processing"><option value="">Any processing</option>{(["Queued", "Processing", "Completed", "NeedsReview", "Failed"] as ProcessingStatus[]).map((p) => <option key={p} value={p}>{processingLabel(p)}</option>)}</select>
          <select className="input w-auto" value={minScore} onChange={(e) => setMinScore(e.target.value)} aria-label="Minimum score"><option value="">Any score</option><option value="75">75 and above</option><option value="50">50 and above</option></select>
          <button className="btn btn-ghost btn-sm" onClick={reset}>Reset</button>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-brand-100 bg-brand-50 px-4 py-2 text-sm text-brand-800">
            <strong>{selected.length} selected</strong>
            <button className="btn btn-secondary btn-sm" onClick={() => bulk("Shortlisted", "Shortlist")}><Star size={14} /> Shortlist</button>
            <button className="btn btn-secondary btn-sm" onClick={() => bulk("OnHold", "Put on hold")}><PauseCircle size={14} /> Hold</button>
            <button className="btn btn-secondary btn-sm text-rose-700" onClick={() => bulk("Rejected", "Reject", true)}><XCircle size={14} /> Reject</button>
            <span className="ml-auto text-xs">Bulk actions never run automatically from scores.</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th className="w-10"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={allChecked} aria-label="Select all"
                  onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])} /></th>
                <th><button className="inline-flex items-center gap-1" onClick={() => toggleSort("name")}>Candidate <SortIcon k="name" /></button></th>
                <th>Applied for</th>
                <th><button className="inline-flex items-center gap-1" onClick={() => toggleSort("score")}>Match <SortIcon k="score" /></button></th>
                <th>Matching skills</th>
                <th>Processing</th>
                <th>Stage</th>
                <th>Interview</th>
                <th><button className="inline-flex items-center gap-1" onClick={() => toggleSort("applied")}>Applied <SortIcon k="applied" /></button></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const s = a.screening;
                const matched = s ? [...s.requiredMatched, ...s.preferredMatched] : [];
                const iv = interviewsFor(a.id).at(-1);
                return (
                  <tr key={a.id}>
                    <td><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={selected.includes(a.id)} aria-label={`Select ${a.candidate.name}`}
                      onChange={(e) => setSelected((x) => (e.target.checked ? [...x, a.id] : x.filter((y) => y !== a.id)))} /></td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.candidate.name} initials={initials(a.candidate.name)} />
                        <div className="min-w-0">
                          <Link to={`/app/candidates/${a.id}`} className="font-medium hover:text-brand-700">{a.candidate.name}</Link>
                          <div className="text-xs text-ink-500">{a.candidate.experience != null ? `${a.candidate.experience} yrs` : "Experience unverified"} · {a.candidate.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{a.job.title}</td>
                    <td><ScoreRing score={s?.score} /></td>
                    <td className="max-w-[270px]">
                      {!s ? <span className="text-ink-400">—</span> : (
                        <div className="flex flex-wrap gap-1">
                          {matched.slice(0, 3).map((m) => <span key={m.skill} className={m.type === "Exact" ? "chip chip-match" : "chip chip-semantic"} title={m.type === "Semantic" ? `Related: ${m.term}` : "Exact match"}>{m.skill}</span>)}
                          {matched.length > 3 && <span className="chip">+{matched.length - 3}</span>}
                          {s.requiredMissing.length > 0 && <span className="chip chip-missing" title={`No resume evidence: ${s.requiredMissing.join(", ")}`}>{s.requiredMissing.length} not evidenced</span>}
                        </div>
                      )}
                    </td>
                    <td><Badge tone={processingTone(a.processing)}>{processingLabel(a.processing)}</Badge></td>
                    <td><Badge tone={stageTone(a.stage)}>{stageLabel(a.stage)}</Badge></td>
                    <td>{iv ? <Badge tone={interviewTone(iv.status)}>R{iv.round} {interviewLabel(iv.status)}</Badge> : <span className="text-ink-400">—</span>}</td>
                    <td className="whitespace-nowrap text-xs text-ink-500">{ago(a.appliedOn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <EmptyState icon={<Search size={20} />} title="No candidates match these filters"><button className="text-brand-700 hover:underline" onClick={reset}>Clear filters</button></EmptyState>}
        </div>
        <div className="border-t border-ink-100 px-4 py-2.5 text-xs text-ink-500">Showing {rows.length} of {applications.length}</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-500">
        <span><span className="chip chip-match">Skill</span> exact match in resume</span>
        <span><span className="chip chip-semantic">Skill</span> related skill (semantic), verify</span>
        <span><span className="chip chip-missing">n not evidenced</span> no resume evidence found. That's missing evidence, not a confirmed gap.</span>
      </div>

      <UploadModal open={upload} onClose={() => setUpload(false)} onDone={() => { setUpload(false); toast("Resume uploaded and queued for processing (prototype, not stored)."); }} />
    </>
  );
}

function UploadModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const pick = (f: File | undefined) => {
    setFile(null);
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext ?? "")) return setError("Only PDF or DOCX files are accepted.");
    if (f.size > 5 * 1024 * 1024) return setError("File is larger than 5 MB.");
    setError("");
    setFile(f);
  };
  return (
    <Modal open={open} onClose={onClose} title="Upload a resume"
      footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (!file) return setError("Choose a file first."); if (!consent) return setError("Confirm candidate consent."); onDone(); setFile(null); setConsent(false); }}><Upload size={15} /> Upload</button></>}>
      <label className="label" htmlFor="up-job">Job</label>
      <select id="up-job" className="input mb-3">{jobs.filter((j) => j.status === "Published").map((j) => <option key={j.id}>{j.title}</option>)}</select>
      <label className="block cursor-pointer rounded-xl border-2 border-dashed border-ink-300 bg-ink-50 p-6 text-center hover:border-brand-400 hover:bg-brand-50">
        <input type="file" accept=".pdf,.docx" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        <Upload className="mx-auto mb-1 text-brand-600" />
        {file ? <><div className="font-medium">{file.name}</div><div className="text-xs text-ink-500">{Math.round(file.size / 1024)} KB · ready</div></>
          : <><div className="font-medium">Choose a PDF or DOCX</div><div className="text-xs text-ink-500">Up to 5 MB. Stored privately and processed in the background.</div></>}
      </label>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" checked={consent} onChange={(e) => setConsent(e.target.checked)} />The candidate has been informed and consents to their data being processed for this application.</label>
    </Modal>
  );
}
