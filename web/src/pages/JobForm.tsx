import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, Send, Sparkles, X } from "lucide-react";
import { departments, subscription, team } from "../data/seed";
import { WEIGHTS } from "../data/scoring";
import { useFeedback } from "../components/feedback";
import { Callout, PageHeader } from "../components/ui";

const SUGGEST = ["C#", "ASP.NET Core", "SQL Server", "Python", "React", "Azure", "Docker", "Kubernetes", "Figma", "Selenium"];

function TagInput({ id, value, onChange, placeholder }: { id: string; value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [text, setText] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (t && !value.some((x) => x.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); }
    if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
  };
  return (
    <div className="input flex min-h-[44px] flex-wrap items-center gap-1.5 py-1.5">
      {value.map((s) => (
        <span key={s} className="chip">{s}<button type="button" onClick={() => onChange(value.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="text-ink-400 hover:text-ink-800"><X size={12} /></button></span>
      ))}
      <input id={id} className="min-w-[140px] flex-1 border-0 bg-transparent text-sm outline-none" value={text} placeholder={placeholder}
        onChange={(e) => setText(e.target.value)} onKeyDown={onKey} onBlur={() => text && add(text)} />
    </div>
  );
}

export default function JobForm() {
  const navigate = useNavigate();
  const { toast } = useFeedback();
  const [title, setTitle] = useState("");
  const [required, setRequired] = useState<string[]>([]);
  const [preferred, setPreferred] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [aiNote, setAiNote] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const draft = () => {
    if (!title.trim()) { toast("Enter a job title first so the draft has something to work from.", "warning"); document.getElementById("title")?.focus(); return; }
    setDrafting(true);
    setTimeout(() => {
      setDescription(
`We are looking for a ${title} to join our team.

About the role
You will work closely with product and engineering stakeholders to deliver reliable, well-tested work and contribute to how the team plans and ships.

What you will do
- Own features from design through release
- Collaborate on technical and product decisions
- Review work and share knowledge with the team

What we are looking for
${required.length ? required.map((s) => `- Hands-on experience with ${s}`).join("\n") : "- Relevant hands-on experience (add required skills to tailor this list)"}
- Clear written and verbal communication`);
      setDrafting(false);
      setAiNote(true);
      toast("Draft inserted. Review and edit it. Nothing is published automatically.", "info");
    }, 1000);
  };

  const submit = (e: FormEvent<HTMLFormElement>, publish: boolean) => {
    e.preventDefault();
    setSubmitted(true);
    const form = e.currentTarget;
    if (publish && (!form.checkValidity() || required.length === 0)) {
      toast("Fill in the highlighted fields and add at least one required skill.", "warning");
      return;
    }
    toast(publish ? `“${title}” published to your careers page (prototype, not saved).` : `“${title || "Untitled job"}” saved as draft (prototype).`);
    navigate("/app/jobs");
  };

  return (
    <form noValidate onSubmit={(e) => submit(e, (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "publish")} className={submitted ? "[&_:invalid]:border-rose-400" : ""}>
      <PageHeader crumbs={<><Link to="/app/jobs" className="hover:text-brand-700">Jobs</Link> / New job</>} title="Create a job"
        subtitle="Required skills drive screening, so keep them specific, verifiable and relevant to the job." />
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <section className="card">
            <div className="card-head"><h2 className="card-title">Basics</h2></div>
            <div className="grid gap-4 p-5 md:grid-cols-12">
              <div className="md:col-span-8"><label className="label req" htmlFor="title">Job title</label><input id="title" className="input" required maxLength={120} placeholder="e.g. Senior .NET Developer" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="md:col-span-4"><label className="label req" htmlFor="dept">Department</label><select id="dept" className="input" required defaultValue=""><option value="">Select…</option>{departments.map((d) => <option key={d}>{d}</option>)}</select></div>
              <div className="md:col-span-4"><label className="label req" htmlFor="loc">Location</label><input id="loc" className="input" required placeholder="e.g. Bengaluru" /></div>
              <div className="md:col-span-4"><label className="label" htmlFor="mode">Work mode</label><select id="mode" className="input" defaultValue="Hybrid"><option>On-site</option><option>Hybrid</option><option>Remote</option></select></div>
              <div className="md:col-span-4"><label className="label" htmlFor="type">Employment type</label><select id="type" className="input"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></div>
              <div className="md:col-span-3"><label className="label req" htmlFor="open">Openings</label><input id="open" className="input" type="number" min={1} defaultValue={1} required /></div>
              <div className="md:col-span-3"><label className="label" htmlFor="min">Min experience (yrs)</label><input id="min" className="input" type="number" min={0} defaultValue={0} /></div>
              <div className="md:col-span-3"><label className="label" htmlFor="max">Max experience (yrs)</label><input id="max" className="input" type="number" min={0} defaultValue={5} /></div>
              <div className="md:col-span-3"><label className="label req" htmlFor="dl">Deadline</label><input id="dl" className="input" type="date" required /></div>
            </div>
          </section>

          <section className="card">
            <div className="card-head"><div><h2 className="card-title">Screening criteria</h2><div className="card-sub">Type a skill and press Enter</div></div></div>
            <div className="p-5">
              <label className="label req" htmlFor="req">Required skills <span className="font-normal text-ink-500">· {WEIGHTS.required}% of match score</span></label>
              <TagInput id="req" value={required} onChange={setRequired} placeholder="Add a skill…" />
              {submitted && required.length === 0 && <p className="mt-1 text-xs text-rose-600">Add at least one required skill.</p>}
              <div className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs text-ink-500">Suggestions:</span>
                {SUGGEST.filter((s) => !required.includes(s)).map((s) => (
                  <button key={s} type="button" className="chip hover:border-brand-300 hover:bg-brand-50" onClick={() => setRequired([...required, s])}><Plus size={11} />{s}</button>
                ))}
              </div>
              <label className="label" htmlFor="pref">Preferred skills <span className="font-normal text-ink-500">· {WEIGHTS.preferred}% of match score</span></label>
              <TagInput id="pref" value={preferred} onChange={setPreferred} placeholder="Add a skill…" />
              <label className="label mt-4" htmlFor="edu">Educational requirements</label>
              <input id="edu" className="input" placeholder="e.g. B.E./B.Tech/MCA or equivalent experience" />
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div><h2 className="card-title">Description</h2><div className="card-sub">Shown on the public job page</div></div>
              <button type="button" className="btn btn-ai btn-sm" onClick={draft} disabled={drafting}>
                {drafting ? <><Loader2 size={14} className="animate-spin" /> Drafting with local model…</> : <><Sparkles size={14} /> Draft with AI</>}
              </button>
            </div>
            <div className="p-5">
              {aiNote && <Callout tone="ai" icon={<Sparkles size={16} />} className="mb-3"><strong>AI-generated draft.</strong> Review and edit before publishing, and check for exaggerated requirements or exclusionary language. It's never published automatically.</Callout>}
              <label className="label req" htmlFor="desc">About the role</label>
              <textarea id="desc" className="input" rows={10} required value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </section>
        </div>

        <div className="xl:col-span-4">
          <div className="space-y-4 xl:sticky xl:top-20">
            <section className="card p-5">
              <h2 className="card-title mb-3">Publishing</h2>
              <label className="label" htmlFor="rec">Assigned recruiter</label>
              <select id="rec" className="input mb-3">{team.filter((t) => t.role !== "Interviewer").map((t) => <option key={t.name}>{t.name}</option>)}</select>
              <label className="label" htmlFor="sal">Salary range <span className="font-normal text-ink-500">(optional)</span></label>
              <input id="sal" className="input mb-3" placeholder="e.g. ₹18–28 LPA" />
              <p className="mb-4 text-xs text-ink-500">Active postings: {subscription.usage[0].used} of {subscription.usage[0].limit} on your plan.</p>
              <div className="grid gap-2">
                <button className="btn btn-primary" type="submit" value="publish"><Send size={15} /> Publish</button>
                <button className="btn btn-secondary" type="submit" value="draft">Save as draft</button>
                <Link to="/app/jobs" className="btn btn-ghost">Cancel</Link>
              </div>
            </section>
            <Callout>Changing required skills after applications arrive creates a new screening configuration version. Existing scores stay unchanged until you re-run screening.</Callout>
          </div>
        </div>
      </div>
    </form>
  );
}
