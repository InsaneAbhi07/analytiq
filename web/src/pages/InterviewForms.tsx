import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { CalendarCheck, CheckCircle2, ClipboardCheck, Eye, Lock, Send, Sparkles } from "lucide-react";
import { interviews, team } from "../data/seed";
import { useStore } from "../data/store";
import { useFeedback } from "../components/feedback";
import { Avatar, Badge, Callout, Dl, EmptyState, PageHeader } from "../components/ui";
import { fmtDateTime, initials, interviewLabel, interviewTone, stageLabel } from "../lib/ui";
import NotFound from "./NotFound";

export function Schedule() {
  const { applications, changeStage } = useStore();
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const [p] = useSearchParams();
  const preselect = Number(p.get("app")) || "";
  const candidates = applications.filter((a) => ["Shortlisted", "Interview"].includes(a.stage) || a.id === preselect);
  const [appId, setAppId] = useState<number | "">(preselect);
  const [panel, setPanel] = useState<string[]>(["Ananya Iyer"]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const selected = applications.find((a) => a.id === appId);

  const suggest = () => {
    const skills = selected?.job.required ?? ["the role's core skills"];
    setQuestions([
      `Walk me through a project where you used ${skills[0]}. What trade-offs did you make?`,
      `How would you approach a production issue involving ${skills[1] ?? skills[0]}?`,
      "Describe a time you changed your design after code or peer review. What changed and why?",
      "How do you decide what to test, and at which level?",
    ]);
    toast("Questions suggested. Edit them freely. The AI doesn't evaluate candidates.", "info");
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    if (!e.currentTarget.checkValidity() || !selected || panel.length === 0) return;
    if (selected.stage !== "Interview") changeStage(selected.id, "Interview");
    toast(`Interview scheduled with ${selected.candidate.name}. Invites go out once email is configured (prototype).`);
    navigate("/app/interviews");
  };

  return (
    <form noValidate onSubmit={submit} className={clsx(tried && "[&_:invalid]:border-rose-400")}>
      <PageHeader crumbs={<><Link to="/app/interviews" className="hover:text-brand-700">Interviews</Link> / Schedule</>} title="Schedule an interview"
        subtitle="Invites are emailed to the candidate and interviewers once email delivery is configured." />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <section className="card">
            <div className="card-head"><h2 className="card-title">Candidate &amp; round</h2></div>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="label req" htmlFor="s-app">Candidate</label>
                <select id="s-app" className="input" required value={appId} onChange={(e) => setAppId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">Select a candidate…</option>
                  {candidates.map((a) => <option key={a.id} value={a.id}>{a.candidate.name} · {a.job.title} ({stageLabel(a.stage)})</option>)}
                </select>
              </div>
              <div><label className="label" htmlFor="s-round">Round</label><select id="s-round" className="input"><option>Round 1</option><option>Round 2</option><option>Round 3</option><option>Final</option></select></div>
              <div className="md:col-span-2"><label className="label req" htmlFor="s-title">Interview title</label><input id="s-title" className="input" required placeholder="e.g. Technical — APIs & data" /></div>
              <div><label className="label" htmlFor="s-type">Type</label><select id="s-type" className="input"><option>Video</option><option>On-site</option><option>Phone</option></select></div>
            </div>
          </section>
          <section className="card">
            <div className="card-head"><h2 className="card-title">When &amp; where</h2></div>
            <div className="grid gap-4 p-5 md:grid-cols-4">
              <div><label className="label req" htmlFor="s-date">Date</label><input id="s-date" className="input" type="date" required min={new Date().toISOString().slice(0, 10)} /></div>
              <div><label className="label req" htmlFor="s-time">Start time</label><input id="s-time" className="input" type="time" required defaultValue="11:00" /></div>
              <div><label className="label" htmlFor="s-dur">Duration</label><select id="s-dur" className="input" defaultValue="60"><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="90">90 min</option></select></div>
              <div><label className="label" htmlFor="s-tz">Time zone</label><select id="s-tz" className="input"><option>Asia/Kolkata (IST)</option><option>Asia/Dubai (GST)</option><option>Europe/London</option><option>America/New_York</option></select></div>
              <div className="md:col-span-4"><label className="label" htmlFor="s-loc">Meeting link or location</label><input id="s-loc" className="input" placeholder="https://meet.example/… or office address" /></div>
              <div className="md:col-span-4"><label className="label" htmlFor="s-notes">Instructions for the candidate</label><textarea id="s-notes" className="input" rows={2} placeholder="What to prepare, who they'll meet, accessibility arrangements…" /></div>
            </div>
          </section>
        </div>
        <div className="space-y-4 lg:col-span-4">
          <section className="card">
            <div className="card-head"><h2 className="card-title">Interviewers</h2></div>
            <div className="space-y-2.5 p-5">
              {team.map((u) => (
                <label key={u.name} className="flex items-center gap-2.5 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={panel.includes(u.name)} onChange={(e) => setPanel((x) => (e.target.checked ? [...x, u.name] : x.filter((y) => y !== u.name)))} />
                  <Avatar name={u.name} initials={initials(u.name)} size="sm" />{u.name}<span className="text-xs text-ink-500">· {u.dept}</span>
                </label>
              ))}
              {tried && panel.length === 0 && <p className="text-xs text-rose-600">Choose at least one interviewer.</p>}
              <p className="text-xs text-ink-500">Interviewers see only this candidate's name, resume and job details.</p>
            </div>
          </section>
          <section className="card">
            <div className="card-head"><h2 className="card-title">Suggested questions</h2><button type="button" className="btn btn-ai btn-sm" onClick={suggest}><Sparkles size={14} /> Suggest</button></div>
            <div className="p-5">
              {questions.length === 0 ? <p className="text-sm text-ink-500">Generate editable, job-related questions from the job's required skills.</p> : (
                <div className="space-y-2">{questions.map((q, i) => (
                  <textarea key={i} className="input text-sm" rows={2} value={q} onChange={(e) => setQuestions((x) => x.map((y, j) => (j === i ? e.target.value : y)))} aria-label={`Question ${i + 1}`} />
                ))}</div>
              )}
              <p className="mt-2 text-xs text-ink-500">Suggestions only. AI doesn't evaluate candidates or personality.</p>
            </div>
          </section>
          <div className="grid gap-2">
            <button className="btn btn-primary"><Send size={15} /> Schedule &amp; send invites</button>
            <Link to="/app/interviews" className="btn btn-ghost">Cancel</Link>
          </div>
        </div>
      </div>
    </form>
  );
}

const CRITERIA = [
  ["technical", "Technical skills", "Depth in the job's required skills"],
  ["problemSolving", "Problem solving", "Approach, reasoning and trade-offs"],
  ["communication", "Communication", "Clarity when explaining work (not accent or fluency)"],
  ["roleKnowledge", "Role knowledge", "Understanding of this job's responsibilities"],
] as const;

export function Feedback() {
  const { id } = useParams();
  const { applications } = useStore();
  const { toast } = useFeedback();
  const navigate = useNavigate();
  const iv = interviews.find((i) => i.id === Number(id));
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [evidence, setEvidence] = useState("");
  const [rec, setRec] = useState("");
  const [tried, setTried] = useState(false);
  if (!iv) return <NotFound />;
  const a = applications.find((x) => x.id === iv.applicationId)!;
  const f = iv.feedback;
  const locked = !!f;
  const val = (k: string) => (f ? (f as unknown as Record<string, number>)[k] : ratings[k]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (CRITERIA.some(([k]) => !ratings[k]) || evidence.trim().length < 30 || !rec) return;
    toast("Feedback submitted. It's locked now and visible to the hiring team.");
    navigate("/app/my-interviews");
  };

  return (
    <form onSubmit={submit}>
      <PageHeader crumbs={<><Link to="/app/my-interviews" className="hover:text-brand-700">My interviews</Link> / Feedback</>}
        title={locked ? "Interview feedback" : "Record interview feedback"}
        subtitle={`${a.candidate.name} · ${a.job.title} · Round ${iv.round}: ${iv.title} · ${fmtDateTime(iv.startsAt)}`}
        actions={locked ? <Badge tone="success" icon={<Lock size={12} />}>Submitted by {f.by} · locked</Badge> : undefined} />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <section className="card">
            <div className="card-head"><div><h2 className="card-title">Structured ratings</h2><div className="card-sub">1 = no evidence · 3 = meets the bar · 5 = strong evidence</div></div></div>
            <div className="divide-y divide-ink-100 px-5">
              {CRITERIA.map(([k, label, help]) => (
                <fieldset key={k} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <legend className="sr-only">{label}</legend>
                  <div><div className="font-medium">{label}</div><div className="text-xs text-ink-500">{help}</div></div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" disabled={locked} aria-pressed={val(k) === n} aria-label={`${label}: ${n}`}
                        onClick={() => setRatings((r) => ({ ...r, [k]: n }))}
                        className={clsx("h-9 w-9 rounded-lg border text-sm font-semibold transition", val(k) === n ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-brand-300", tried && !locked && !ratings[k] && "border-rose-300")}>{n}</button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>
          <section className="card p-5">
            <label className="label req" htmlFor="fb-ev">What did you observe?</label>
            <textarea id="fb-ev" className={clsx("input mb-1", tried && evidence.trim().length < 30 && "border-rose-400")} rows={5} readOnly={locked}
              value={locked ? f.evidence : evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Specific answers, code, examples. Avoid impressions and personal attributes." />
            {tried && !locked && evidence.trim().length < 30 && <p className="mb-2 text-xs text-rose-600">Add at least a few sentences of evidence (30+ characters).</p>}
            <label className="label req mt-3" htmlFor="fb-rec">Recommendation</label>
            <select id="fb-rec" className={clsx("input", tried && !rec && !locked && "border-rose-400")} disabled={locked} value={locked ? f.recommendation : rec} onChange={(e) => setRec(e.target.value)}>
              <option value="">Select…</option>{["Strong advance", "Advance", "Hold — needs another round", "Do not advance"].map((r) => <option key={r}>{r}</option>)}
            </select>
            <p className="mt-1 text-xs text-ink-500">This is input to the hiring decision. The recruiter and hiring manager make the final call.</p>
          </section>
        </div>
        <div className="space-y-4 lg:col-span-4">
          <section className="card p-5">
            <Dl items={[["Candidate", a.candidate.name], ["Job", a.job.title], ["Type", `${iv.type} · ${iv.duration} min`], ["Where", iv.location], ["Panel", iv.interviewers.join(", ")], ["Status", <Badge tone={interviewTone(iv.status)}>{interviewLabel(iv.status)}</Badge>]]} />
            <div className="mb-1.5 mt-4 text-xs font-semibold">Required skills for this job</div>
            <div className="flex flex-wrap gap-1.5">{a.job.required.map((s) => <span key={s} className="chip">{s}</span>)}</div>
          </section>
          {locked ? (
            <section className="card p-5 text-center"><div className="text-xs text-ink-500">Average rating</div><div className="font-display text-4xl font-bold">{((f.technical + f.problemSolving + f.communication + f.roleKnowledge) / 4).toFixed(1)}<span className="text-base text-ink-400"> / 5</span></div></section>
          ) : (
            <div className="grid gap-2">
              <button className="btn btn-primary"><CheckCircle2 size={15} /> Submit feedback</button>
              <button type="button" className="btn btn-secondary" onClick={() => toast("Draft saved (prototype).", "info")}>Save draft</button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

/** Interviewer view: only interviews assigned to the signed-in interviewer. */
export function MyInterviews() {
  const me = "Ananya Iyer";
  const { applications } = useStore();
  const mine = interviews.filter((i) => i.interviewers.includes(me)).sort((a, b) => +a.startsAt - +b.startsAt);
  const upcoming = mine.filter((i) => i.status === "Scheduled");
  const done = mine.filter((i) => i.status !== "Scheduled").reverse();

  const List = ({ items }: { items: typeof mine }) => items.length === 0 ? <EmptyState icon={<CalendarCheck size={20} />} title="Nothing here" /> : (
    <ul>
      {items.map((i) => {
        const a = applications.find((x) => x.id === i.applicationId)!;
        return (
          <li key={i.id} className="flex flex-wrap items-center gap-4 border-b border-ink-100 px-5 py-3.5 last:border-0">
            <div className="w-32 text-sm font-semibold">{fmtDateTime(i.startsAt)}</div>
            <div className="min-w-[180px] flex-1"><div className="font-medium">{a.candidate.name}</div><div className="text-xs text-ink-500">Round {i.round} · {i.title} · {a.job.title}</div></div>
            <Badge tone={interviewTone(i.status)}>{interviewLabel(i.status)}</Badge>
            {i.status !== "Cancelled" && <Link to={`/app/interviews/${i.id}/feedback`} className="btn btn-secondary btn-sm"><ClipboardCheck size={14} /> {i.feedback ? "View feedback" : "Record feedback"}</Link>}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <Callout tone="info" icon={<Eye size={16} />} className="mb-4"><strong>Prototype: interviewer view as {me}.</strong> Interviewers see only the interviews assigned to them and the candidate details needed for the interview. They don't see scores, salary, other candidates or recruiter notes.</Callout>
      <PageHeader title="My interviews" subtitle={`${upcoming.length} upcoming · ${done.filter((i) => i.feedback).length} feedback submitted`} />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <section className="card"><div className="card-head"><h2 className="card-title">Upcoming</h2></div><List items={upcoming} /></section>
          <section className="card"><div className="card-head"><h2 className="card-title">Completed</h2></div><List items={done} /></section>
        </div>
        <section className="card h-fit p-5 lg:col-span-4">
          <h2 className="mb-2 font-semibold">Giving good feedback</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-600">
            <li>Rate each criterion against the job, not against other candidates.</li>
            <li>Write down what you observed, such as answers and code, rather than impressions.</li>
            <li>Don't comment on age, appearance, accent, family or other personal attributes.</li>
            <li>Submit within 24 hours. Feedback is locked once submitted.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
