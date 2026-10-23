import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import clsx from "clsx";
import {
  AlertTriangle, CalendarPlus, Check, ChevronDown, Download, FileText, Mail, MapPin, Phone, RefreshCw, ShieldCheck, Sparkles, Star, Trash2, XOctagon,
} from "lucide-react";
import { MODEL_VERSION, SEMANTIC_CREDIT } from "../data/scoring";
import { interviewsFor, offerFor, useStore } from "../data/store";
import { useFeedback } from "../components/feedback";
import { Avatar, Badge, Callout, Dl, EmptyState, Meter, ScoreRing } from "../components/ui";
import { fmtDate, fmtDateTime, initials, interviewLabel, interviewTone, offerTone, processingLabel, processingTone, stageLabel, stageTone } from "../lib/ui";
import type { SkillMatch, Stage } from "../data/types";
import NotFound from "./NotFound";

const TL_DOT: Record<string, string> = { info: "border-sky-500", muted: "border-ink-300", ai: "border-ai-500", primary: "border-brand-500", success: "border-emerald-500", warning: "border-amber-500", danger: "border-rose-500" };

function Evidence({ m }: { m: SkillMatch }) {
  const exact = m.type === "Exact";
  return (
    <div className="mb-2 rounded-lg border border-ink-200 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <strong>{m.skill}</strong>
        {exact ? <span className="chip chip-match"><Check size={12} /> Exact</span>
          : <span className="chip chip-semantic" title="Cosine similarity from the local embedding model">Related: {m.term} · {m.similarity.toFixed(2)}</span>}
      </div>
      <div className="mt-0.5 text-xs text-ink-500">{m.section}</div>
      <p className={clsx("mt-2 border-l-[3px] pl-3 text-ink-700", exact ? "border-emerald-300" : "border-ai-500/50")}>{m.evidence}</p>
      {!exact && <p className="mt-1.5 text-xs text-ai-700">Counted at {SEMANTIC_CREDIT * 100}% credit. Confirm the candidate's actual {m.skill} experience.</p>}
    </div>
  );
}

export default function CandidateProfile() {
  const { id } = useParams();
  const { applications, changeStage, addNote } = useStore();
  const { toast, confirm } = useFeedback();
  const [tab, setTab] = useState<"screening" | "resume" | "interviews" | "notes">("screening");
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState("");
  const a = applications.find((x) => x.id === Number(id));
  if (!a) return <NotFound />;

  const c = a.candidate;
  const s = a.screening;
  const ivs = interviewsFor(a.id);
  const offer = offerFor(a.id);
  const others = applications.filter((x) => x.candidateId === a.candidateId && x.id !== a.id);
  const open = !["Hired", "Rejected", "Withdrawn"].includes(a.stage);

  const move = async (to: Stage, opts: { reason?: boolean; danger?: boolean; message?: string } = {}) => {
    setMenu(false);
    const res = await confirm({
      title: `Move to “${stageLabel(to)}”?`,
      message: opts.message ?? "This change is recorded in the application history with your name and the time.",
      ok: `Move to ${stageLabel(to)}`, danger: opts.danger, reason: opts.reason,
    });
    if (!res) return;
    changeStage(a.id, to, res.reason || undefined);
    toast(`Stage changed to ${stageLabel(to)}. (Prototype: kept until you reload.)`);
  };

  return (
    <>
      <div className="mb-1.5 text-xs text-ink-500">
        <Link to="/app/candidates" className="hover:text-brand-700">Candidates</Link> / <Link to={`/app/jobs/${a.jobId}`} className="hover:text-brand-700">{a.job.title}</Link> / {c.name}
      </div>

      <section className="card mb-4 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={c.name} initials={initials(c.name)} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">{c.name} <Badge tone={stageTone(a.stage)}>{stageLabel(a.stage)}</Badge></h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
              <span>{c.headline}</span>
              <span className="inline-flex items-center gap-1"><MapPin size={13} />{c.location}</span>
              <span className="inline-flex items-center gap-1"><Mail size={13} />{c.email}</span>
              <span className="inline-flex items-center gap-1"><Phone size={13} />{c.phone}</span>
              {c.links?.map((l) => <span key={l} className="text-brand-700">{l}</span>)}
            </div>
          </div>
          {open && (
            <div className="flex flex-wrap gap-2">
              {["New", "Screening", "OnHold", "InfoRequested"].includes(a.stage) && <button className="btn btn-primary" onClick={() => move("Shortlisted")}><Star size={15} /> Shortlist</button>}
              <Link to={`/app/interviews/schedule?app=${a.id}`} className="btn btn-secondary"><CalendarPlus size={15} /> Schedule interview</Link>
              <div className="relative">
                <button className="btn btn-secondary" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>More <ChevronDown size={15} /></button>
                {menu && (<>
                  <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-40 mt-2 w-56 animate-slide-in overflow-hidden rounded-xl border border-ink-200 bg-white py-1 text-sm shadow-pop">
                    <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => move("OnHold", { reason: true })}>Put on hold</button>
                    <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => move("InfoRequested", { reason: true, message: "The candidate gets a secure link to add the requested information. Describe what you need." })}>Request more information</button>
                    <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => move("Interview")}>Move to interview</button>
                    <button className="block w-full px-4 py-2 text-left hover:bg-ink-50" onClick={() => move("Withdrawn", { reason: true, message: "Use this when the candidate has withdrawn their application." })}>Mark as withdrawn</button>
                    <div className="my-1 border-t border-ink-100" />
                    <button className="block w-full px-4 py-2 text-left text-rose-700 hover:bg-rose-50" onClick={() => move("Rejected", { reason: true, danger: true, message: "Rejection is a human decision, so record the job-related reason. The AI score alone isn't a sufficient reason." })}>Reject</button>
                  </div>
                </>)}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <div className="mb-4 flex gap-1 overflow-x-auto border-b border-ink-200" role="tablist">
            {([["screening", "Screening explanation"], ["resume", "Resume"], ["interviews", `Interviews & offer (${ivs.length})`], ["notes", `Notes (${a.notes.length})`]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={clsx("whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium", tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900")}>{l}</button>
            ))}
          </div>

          {tab === "screening" && (a.processing === "Failed" ? (
            <section className="card p-5">
              <Callout tone="danger" icon={<XOctagon size={16} />} className="mb-3"><strong>Resume couldn't be processed.</strong> {a.processingError}. Tried 3 times. No score was produced, and the candidate hasn't been penalised for this.</Callout>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => toast("Re-upload request sent to candidate via secure link (prototype).")}><Mail size={14} /> Request re-upload</button>
                <button className="btn btn-secondary btn-sm" onClick={() => toast("Processing retry queued (prototype).", "info")}><RefreshCw size={14} /> Retry processing</button>
                <button className="btn btn-secondary btn-sm" onClick={() => move("Screening")}>Review manually</button>
              </div>
            </section>
          ) : !s ? (
            <section className="card p-5">
              <Callout tone="info" icon={<RefreshCw size={16} className="animate-spin" />} className="mb-4"><strong>Resume is {processingLabel(a.processing).toLowerCase()}.</strong> Text extraction and matching run in the background, usually within a minute.</Callout>
              <div className="space-y-2"><div className="skeleton h-4 w-2/5" /><div className="skeleton h-3 w-11/12" /><div className="skeleton h-3 w-3/4" /><div className="skeleton h-3 w-3/5" /></div>
            </section>
          ) : (
            <div className="space-y-4">
              <section className="card">
                <div className="flex flex-wrap items-center gap-6 p-5">
                  <ScoreRing score={s.score} size={112} />
                  <div className="min-w-[260px] flex-1">
                    <div className="mb-1 text-sm text-ink-500">Job compatibility for <strong className="text-ink-900">{a.job.title}</strong></div>
                    {s.components.map((comp) => (
                      <div key={comp.name} className="border-b border-dashed border-ink-200 py-2.5 last:border-0">
                        <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{comp.name} <span className="font-normal text-ink-500">· weight {comp.weight}%</span></span>
                          <span className="tabular-nums">{comp.fraction == null ? "Unknown" : `${Math.round(comp.fraction * 100)}%`}</span></div>
                        {comp.fraction == null
                          ? <div className="h-2 rounded-full" style={{ background: "repeating-linear-gradient(45deg,#d9d9e6 0 4px,#f1f1f7 4px 8px)" }} />
                          : <Meter value={comp.fraction * 100} />}
                        <div className="mt-1 text-xs text-ink-500">{comp.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {s.warnings.length > 0 && <div className="space-y-2 px-5 pb-5">{s.warnings.map((w) => <Callout key={w} tone="warning" icon={<AlertTriangle size={16} />}>{w}</Callout>)}</div>}
                <div className="grid grid-cols-2 gap-3 rounded-b-xl border-t border-ink-100 bg-ink-50/70 px-5 py-3 text-xs text-ink-500 md:grid-cols-5">
                  {[["Method", "Weighted skill & experience match"], ["Model", MODEL_VERSION], ["Configuration", s.configVersion], ["Screened", fmtDateTime(s.screenedOn)], ["Parsing confidence", c.parsingConfidence != null ? `${c.parsingConfidence}%` : "—"]].map(([k, v]) => (
                    <div key={k}>{k}<strong className="block text-[0.8rem] font-medium text-ink-900">{v}</strong></div>
                  ))}
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="card">
                  <div className="card-head"><h2 className="card-title">Required skills</h2><span className="text-xs text-ink-500">{s.requiredMatched.length} of {a.job.required.length} evidenced</span></div>
                  <div className="p-4">
                    {s.requiredMatched.map((m) => <Evidence key={m.skill} m={m} />)}
                    {s.requiredMissing.map((miss) => (
                      <div key={miss} className="mb-2 rounded-lg border border-ink-200 p-3 text-sm">
                        <div className="flex items-center justify-between"><strong>{miss}</strong><span className="chip chip-missing">No evidence found</span></div>
                        <p className="mt-1 text-xs text-ink-500">The resume doesn't mention this skill or a closely related one. That doesn't mean the candidate lacks it, so verify at phone screen.</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="card">
                  <div className="card-head"><h2 className="card-title">Preferred skills</h2><span className="text-xs text-ink-500">{s.preferredMatched.length} of {a.job.preferred.length} evidenced</span></div>
                  <div className="p-4">
                    {s.preferredMatched.map((m) => <Evidence key={m.skill} m={m} />)}
                    {s.preferredMissing.length > 0 && <><div className="mb-1.5 text-xs text-ink-500">No evidence found for:</div><div className="flex flex-wrap gap-1.5">{s.preferredMissing.map((m) => <span key={m} className="chip chip-missing">{m}</span>)}</div></>}
                  </div>
                </section>
              </div>

              <section className="card flex flex-wrap items-center gap-3 p-4">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span className="flex-1 text-xs text-ink-500">Name, photo, gender, age, religion, caste and location aren't used. Instructions embedded in resume text are ignored.</span>
                <button className="btn btn-secondary btn-sm" onClick={async () => { const r = await confirm({ title: "Override screening result?", message: "This records your corrected assessment alongside the AI result. Both are kept for audit.", ok: "Save override", reason: true }); if (r) toast("Override recorded with your reason (prototype)."); }}>Override / correct</button>
                <button className="btn btn-secondary btn-sm" onClick={() => toast("Re-screening queued with the current job configuration (uses 1 credit).", "info")}><RefreshCw size={14} /> Re-run</button>
              </section>
            </div>
          ))}

          {tab === "resume" && (
            <section className="card">
              <div className="card-head">
                <div className="flex items-center gap-2"><FileText size={18} className={c.resumeFile.endsWith(".pdf") ? "text-rose-500" : "text-sky-600"} />
                  <div><div className="text-sm font-medium">{c.resumeFile}</div><div className="text-xs text-ink-500">{c.resumeKb} KB · uploaded {fmtDate(a.appliedOn)} · private storage</div></div></div>
                <button className="btn btn-secondary btn-sm" onClick={() => toast("In the real build this streams through an authorised, audited endpoint — never a public URL.", "info")}><Download size={14} /> Download</button>
              </div>
              <div className="p-5">
                {!s ? <EmptyState icon={<FileText size={20} />} title="Preview unavailable">Text couldn't be extracted yet. Download the original file to review it.</EmptyState> : (
                  <div className="max-h-[560px] overflow-y-auto rounded-lg border border-ink-200 bg-white p-7 text-[0.84rem] text-ink-700 shadow-[inset_0_0_0_6px_#f7f7fb]">
                    <h3 className="text-lg font-bold">{c.name}</h3>
                    <div>{c.headline} · {c.location} · {c.email}</div>
                    {[["Experience", c.work.map((w) => <div key={w.company} className="mb-2"><strong>{w.role}</strong>, {w.company} <span className="text-ink-400">· {w.period}</span><div>{w.summary}</div></div>)],
                      ["Skills", <div key="s">{c.skills.join(" · ")}</div>],
                      ["Education", c.education.map((e) => <div key={e}>{e}</div>)],
                      ["Certifications", c.certifications.map((e) => <div key={e}>{e}</div>)],
                      ["Projects", c.projects.map((e) => <div key={e}>{e}</div>)],
                    ].filter(([, v]) => !Array.isArray(v) || v.length > 0).map(([h, v]) => (
                      <div key={h as string}><h4 className="mb-1.5 mt-5 text-[0.72rem] font-semibold uppercase tracking-wider text-ink-400">{h}</h4>{v}</div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-ink-500">Sanitised text preview. Macros, scripts and embedded links in the original file are never executed.</p>
              </div>
            </section>
          )}

          {tab === "interviews" && (
            <div className="space-y-4">
              {ivs.length === 0 && <div className="card"><EmptyState icon={<CalendarPlus size={20} />} title="No interviews yet" /></div>}
              {ivs.map((i) => (
                <section key={i.id} className="card">
                  <div className="card-head"><div><h3 className="card-title">Round {i.round} · {i.title}</h3><div className="card-sub">{fmtDateTime(i.startsAt)} IST · {i.type} · {i.location}</div></div><Badge tone={interviewTone(i.status)}>{interviewLabel(i.status)}</Badge></div>
                  <div className="p-5 text-sm">
                    <div className="mb-2"><span className="text-ink-500">Interviewers:</span> {i.interviewers.join(", ")}</div>
                    {i.feedback ? (<>
                      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {([["Technical", i.feedback.technical], ["Problem solving", i.feedback.problemSolving], ["Communication", i.feedback.communication], ["Role knowledge", i.feedback.roleKnowledge]] as const).map(([k, v]) => (
                          <div key={k} className="rounded-lg bg-ink-50 p-2.5"><div className="text-xs text-ink-500">{k}</div><div className="font-semibold">{v} / 5</div></div>
                        ))}
                      </div>
                      <div className="rounded-lg border border-ink-200 p-3"><div className="flex justify-between"><strong>{i.feedback.recommendation}</strong><span className="text-xs text-ink-500">{i.feedback.by}</span></div><p className="mt-1.5 border-l-[3px] border-ink-200 pl-3 text-ink-700">{i.feedback.evidence}</p></div>
                    </>) : i.status === "Scheduled" && <span className="text-ink-500">Feedback opens after the interview.</span>}
                  </div>
                </section>
              ))}
              {offer && (
                <section className="card">
                  <div className="card-head"><h3 className="card-title">Offer</h3><Badge tone={offerTone(offer.status)}>{offer.status}</Badge></div>
                  <div className="p-5"><Dl items={[["Designation", offer.designation], ["Annual CTC", <>₹{offer.ctcLakh} LPA <span className="text-xs text-ink-500">· visible to Admin &amp; Recruiter only</span></>], ["Proposed joining", fmtDate(offer.joining)], ["Sent", offer.sentOn ? fmtDate(offer.sentOn) : "Not sent"]]} /></div>
                </section>
              )}
            </div>
          )}

          {tab === "notes" && (
            <section className="card p-5">
              <form onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return; addNote(a.id, note.trim()); setNote(""); toast("Note added. Visible to your company's recruiters only."); }} className="mb-4">
                <label className="label" htmlFor="note">Add a note <span className="font-normal text-ink-500">· not visible to the candidate</span></label>
                <textarea id="note" className="input mb-2" rows={3} placeholder="Keep notes factual and job-related." value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="btn btn-primary btn-sm" disabled={!note.trim()}>Add note</button>
              </form>
              {a.notes.length === 0 && <p className="text-sm text-ink-500">No notes yet.</p>}
              {a.notes.map((n, i) => (
                <div key={i} className="mb-2 rounded-lg border border-ink-200 p-3">
                  <div className="mb-1 flex justify-between text-xs"><strong className="text-ink-900">{n.by}</strong><span className="text-ink-500">{fmtDateTime(n.on)}</span></div>
                  <p className="text-sm">{n.text}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="space-y-4 xl:col-span-4">
          <section className="card">
            <div className="card-head"><h2 className="card-title">Application</h2><span className="text-xs text-ink-500">#{a.id}</span></div>
            <div className="p-5"><Dl items={[
              ["Job", <Link to={`/app/jobs/${a.jobId}`} className="text-brand-700 hover:underline">{a.job.title}</Link>],
              ["Applied", fmtDateTime(a.appliedOn)], ["Source", a.source],
              ["Processing", <Badge tone={processingTone(a.processing)}>{processingLabel(a.processing)}</Badge>],
              ["Recruiter", a.recruiter],
              ["Consent", <span className="inline-flex items-center gap-1"><Check size={14} className="text-emerald-600" /> Privacy notice accepted</span>],
              ["Tracking code", <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">{a.trackingCode}</code>],
            ]} /></div>
          </section>

          <section className="card">
            <div className="card-head"><h2 className="card-title">Status history</h2></div>
            <ol className="relative space-y-4 p-5 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-0.5 before:bg-ink-200">
              {a.history.map((h, i) => (
                <li key={i} className="relative pl-7 text-sm">
                  <span className={clsx("absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-[3px] bg-white", TL_DOT[h.kind])} />
                  <div className="font-medium">{h.title}</div>
                  <div className="text-xs text-ink-500">{fmtDateTime(h.on)} · {h.by}</div>
                  {h.reason && <div className="mt-1 rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-xs text-ink-700">Reason: {h.reason}</div>}
                </li>
              ))}
            </ol>
          </section>

          {others.length > 0 && (
            <section className="card">
              <div className="card-head"><h2 className="card-title">Other applications</h2></div>
              {others.map((o) => (
                <Link key={o.id} to={`/app/candidates/${o.id}`} className="flex items-center gap-3 border-b border-ink-100 px-5 py-3 last:border-0 hover:bg-ink-50">
                  <ScoreRing score={o.screening?.score} />
                  <div className="flex-1"><div className="font-medium">{o.job.title}</div><div className="text-xs text-ink-500">{fmtDate(o.appliedOn)}</div></div>
                  <Badge tone={stageTone(o.stage)}>{stageLabel(o.stage)}</Badge>
                </Link>
              ))}
            </section>
          )}

          <section className="card p-5">
            <div className="mb-2 text-sm font-semibold">Candidate data</div>
            <div className="grid gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => toast("Data export prepared for the candidate's access request (prototype).", "info")}><Sparkles size={14} /> Export candidate data</button>
              <button className="btn btn-secondary btn-sm text-rose-700" onClick={async () => { const r = await confirm({ title: "Process deletion request?", message: "Deletes the candidate's resume, extracted data and applications at this company. Audit entries are kept without personal data.", ok: "Schedule deletion", danger: true, reason: true }); if (r) toast("Deletion scheduled and logged (prototype)."); }}><Trash2 size={14} /> Process deletion request</button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
