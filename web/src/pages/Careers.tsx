import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { ArrowRight, BarChart2, Check, Clock, Home, Lock, MapPin, Network, Search, Upload } from "lucide-react";
import { company, jobs } from "../data/seed";
import { useStore } from "../data/store";
import { useFeedback } from "../components/feedback";
import { Badge, Callout, EmptyState } from "../components/ui";
import { candidateStatus, fmtDate } from "../lib/ui";
import NotFound from "./NotFound";

const published = jobs.filter((j) => j.status === "Published");

export function Careers() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const loc = params.get("loc") ?? "";
  const [text, setText] = useState(q);
  const list = published.filter((j) =>
    (!q || `${j.title} ${j.department} ${j.required.join(" ")}`.toLowerCase().includes(q.toLowerCase())) &&
    (!loc || j.location === loc || j.workMode === loc));

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 pb-20 pt-12 text-ink-300">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 font-bold text-white">{company.short}</span>
            <div><div className="text-xs text-ink-400">Careers</div><div className="font-semibold text-white">{company.name}</div></div>
          </div>
          <h1 className="max-w-2xl text-3xl font-bold text-white md:text-4xl">Build the payments infrastructure India's banks run on.</h1>
          <p className="mt-3 max-w-xl">We hire for skills and potential, and a person reviews every application.</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <form className="card relative -mt-9 mb-8 grid gap-2 p-3 md:grid-cols-[1fr_200px_auto]" role="search"
          onSubmit={(e) => { e.preventDefault(); setParams((p) => { text ? p.set("q", text) : p.delete("q"); return p; }); }}>
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input className="input pl-9" placeholder="Job title, skill or team" value={text} onChange={(e) => setText(e.target.value)} aria-label="Keyword" /></div>
          <select className="input" value={loc} aria-label="Location" onChange={(e) => setParams((p) => { e.target.value ? p.set("loc", e.target.value) : p.delete("loc"); return p; })}>
            <option value="">All locations</option>{[...new Set(published.map((j) => j.location))].map((l) => <option key={l}>{l}</option>)}<option>Remote</option>
          </select>
          <button className="btn btn-primary">Search</button>
        </form>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">{list.length} open {list.length === 1 ? "role" : "roles"}</h2>
          {(q || loc) && <button className="text-sm text-brand-700 hover:underline" onClick={() => { setText(""); setParams({}); }}>Clear search</button>}</div>
        {list.length === 0 && <div className="card"><EmptyState icon={<Search size={20} />} title="No roles match your search">Try a different keyword or location.</EmptyState></div>}
        <div className="space-y-3">
          {list.map((j) => (
            <Link key={j.id} to={`/careers/jobs/${j.id}`} className="card group flex flex-wrap justify-between gap-4 p-5 transition hover:border-brand-200 hover:shadow-pop">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-brand-700">{j.title}</h3>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                  <span className="inline-flex items-center gap-1"><Network size={14} />{j.department}</span>
                  <span className="inline-flex items-center gap-1"><MapPin size={14} />{j.location}</span>
                  <span className="inline-flex items-center gap-1"><Home size={14} />{j.workMode}</span>
                  <span className="inline-flex items-center gap-1"><BarChart2 size={14} />{j.minExp}–{j.maxExp} yrs</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">{j.required.slice(0, 5).map((s) => <span key={s} className="chip">{s}</span>)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{j.salary}</div>
                <div className="text-xs text-ink-500">Apply by {fmtDate(j.deadline)}</div>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700">View role <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export function CareerJob() {
  const { id } = useParams();
  const { toast } = useFeedback();
  const j = published.find((x) => x.id === Number(id));
  if (!j) return <NotFound />;
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-2 text-xs text-ink-500"><Link to="/careers" className="hover:text-brand-700">All roles</Link> / {j.title}</div>
        <h1 className="text-3xl font-bold">{j.title}</h1>
        <div className="mb-6 mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500"><span>{j.department}</span><span>{j.location}</span><span>{j.workMode}</span><span>{j.employmentType}</span><span>{j.openings} opening(s)</span></div>
        <div className="space-y-5 text-[0.95rem] leading-relaxed text-ink-700">
          <div><h2 className="mb-2 text-lg font-semibold">About the role</h2><p>{j.summary}</p></div>
          <div><h2 className="mb-2 text-lg font-semibold">What you'll do</h2><ul className="list-disc space-y-1 pl-5">{j.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul></div>
          <div><h2 className="mb-2 text-lg font-semibold">What we're looking for</h2><ul className="list-disc space-y-1 pl-5"><li>{j.minExp}–{j.maxExp} years of relevant experience</li>{j.required.map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div><h2 className="mb-2 text-lg font-semibold">Nice to have</h2><ul className="list-disc space-y-1 pl-5">{j.preferred.map((s) => <li key={s}>{s}</li>)}</ul></div>
          <div><h2 className="mb-2 text-lg font-semibold">How we review applications</h2><p>An automated tool helps our recruiters spot the skills this role needs in your resume. A person reviews every application and makes every decision. If you don't meet every requirement, apply anyway.</p></div>
        </div>
      </div>
      <aside>
        <div className="card p-5 lg:sticky lg:top-24">
          <div className="text-xs text-ink-500">Salary range</div><div className="mb-3 text-lg font-semibold">{j.salary}</div>
          <div className="text-xs text-ink-500">Apply by</div><div className="mb-4 font-medium">{fmtDate(j.deadline)}</div>
          <Link to={`/careers/jobs/${j.id}/apply`} className="btn btn-primary btn-lg w-full">Apply now</Link>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500"><Clock size={13} /> Takes about 3 minutes. You'll need your resume (PDF or DOCX).</p>
          <button className="btn btn-secondary btn-sm mt-4 w-full" onClick={() => toast("Link copied to clipboard.")}>Share this role</button>
        </div>
      </aside>
    </div>
  );
}

export function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const j = published.find((x) => x.id === Number(id));
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [tried, setTried] = useState(false);
  if (!j) return <NotFound />;

  const pick = (f?: File) => {
    setFile(null);
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext ?? "")) return setFileError("Only PDF or DOCX files are accepted.");
    if (f.size > 5 * 1024 * 1024) return setFileError("File is larger than 5 MB.");
    if (f.size === 0) return setFileError("The file is empty.");
    setFileError("");
    setFile(f);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    if (!file) setFileError("Please attach your resume.");
    if (!e.currentTarget.checkValidity() || !file) return;
    const name = String(new FormData(e.currentTarget).get("name"));
    const code = "ZF-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    navigate(`/careers/confirmation?job=${j.id}&code=${code}&name=${encodeURIComponent(name.split(" ")[0])}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-2 text-xs text-ink-500"><Link to="/careers" className="hover:text-brand-700">All roles</Link> / <Link to={`/careers/jobs/${j.id}`} className="hover:text-brand-700">{j.title}</Link> / Apply</div>
      <h1 className="text-2xl font-bold">Apply for {j.title}</h1>
      <p className="mb-6 text-ink-500">{company.name} · {j.location} · {j.workMode}</p>
      <form noValidate onSubmit={submit} className={clsx("space-y-4", tried && "[&_:invalid]:border-rose-400")}>
        <section className="card">
          <div className="card-head"><h2 className="card-title">Your details</h2></div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div><label className="label req" htmlFor="name">Full name</label><input id="name" name="name" className="input" required maxLength={100} autoComplete="name" /></div>
            <div><label className="label req" htmlFor="aemail">Email</label><input id="aemail" className="input" type="email" required autoComplete="email" /></div>
            <div><label className="label req" htmlFor="aphone">Mobile number</label><input id="aphone" className="input" type="tel" required pattern="[0-9+\s\-]{10,15}" autoComplete="tel" placeholder="+91 98xxx xxxxx" /></div>
            <div><label className="label" htmlFor="profile">LinkedIn, GitHub or portfolio <span className="font-normal text-ink-500">(optional)</span></label><input id="profile" className="input" type="url" placeholder="https://" /></div>
          </div>
        </section>
        <section className="card">
          <div className="card-head"><h2 className="card-title">Resume</h2></div>
          <div className="p-5">
            <label className={clsx("block cursor-pointer rounded-xl border-2 border-dashed p-7 text-center transition", fileError ? "border-rose-300 bg-rose-50" : "border-ink-300 bg-ink-50 hover:border-brand-400 hover:bg-brand-50")}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}>
              <input type="file" accept=".pdf,.docx" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
              <Upload className="mx-auto mb-1.5 text-brand-600" />
              {file ? <><div className="font-medium">{file.name}</div><div className="text-xs text-ink-500">{Math.round(file.size / 1024)} KB · ready to upload</div></>
                : <><div className="font-medium">Upload your resume</div><div className="text-xs text-ink-500">Drag and drop, or tap to choose · PDF or DOCX, up to 5 MB</div></>}
            </label>
            {fileError && <p className="mt-2 text-sm text-rose-600">{fileError}</p>}
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500"><Lock size={12} /> Your resume is stored privately and only seen by {company.name}'s hiring team.</p>
          </div>
        </section>
        <section className="card">
          <div className="card-head"><h2 className="card-title">A few questions</h2></div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div><label className="label req" htmlFor="notice">Notice period</label><select id="notice" className="input" required defaultValue=""><option value="">Select…</option>{["Immediate", "15 days", "30 days", "60 days", "90 days"].map((n) => <option key={n}>{n}</option>)}</select></div>
            <div><label className="label req" htmlFor="wm">Can you work {j.workMode.toLowerCase()} from {j.location}?</label><select id="wm" className="input" required defaultValue=""><option value="">Select…</option><option>Yes</option><option>No</option><option>Need to discuss</option></select></div>
          </div>
        </section>
        <section className="card space-y-3 p-5 text-sm">
          <label className="flex gap-2.5"><input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" />
            <span>I've read the candidate privacy notice. My information will be used to assess this application, and an automated tool assists recruiters, but a person makes every decision.</span></label>
          <label className="flex gap-2.5"><input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" /><span>Optional: keep my profile for up to 12 months and contact me about other suitable roles.</span></label>
        </section>
        {tried && <Callout tone="danger">Please complete the highlighted fields and attach your resume.</Callout>}
        <div className="flex justify-end gap-2"><Link to={`/careers/jobs/${j.id}`} className="btn btn-secondary">Back</Link><button className="btn btn-primary btn-lg">Submit application</button></div>
      </form>
    </div>
  );
}

const STEPS = ["Submitted", "Under review", "Interview", "Decision"];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex">
      {STEPS.map((s, i) => (
        <li key={s} className="relative flex-1 pt-8 text-center text-xs">
          {i > 0 && <span className={clsx("absolute left-[-50%] right-1/2 top-[13px] h-[3px]", i <= current ? "bg-brand-500" : "bg-ink-200")} />}
          <span className={clsx("absolute left-1/2 top-1 z-10 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border-[3px] bg-white", i < current ? "border-brand-500 bg-brand-500 text-white" : i === current ? "border-brand-500" : "border-ink-300")}>
            {i < current && <Check size={12} />}
          </span>
          <span className={i === current ? "font-semibold text-brand-700" : i < current ? "text-ink-900" : "text-ink-400"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function Confirmation() {
  const [p] = useSearchParams();
  const j = jobs.find((x) => x.id === Number(p.get("job")));
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={32} /></div>
        <h1 className="text-2xl font-bold">Application received</h1>
        <p className="mt-2 text-ink-500">Thanks{p.get("name") ? `, ${p.get("name")}` : ""}. Your application for <strong className="text-ink-900">{j?.title ?? "this role"}</strong> at {company.name} has been submitted. A confirmation email is on its way.</p>
        <div className="my-6 rounded-xl bg-ink-50 p-4">
          <div className="text-xs text-ink-500">Your tracking code</div>
          <div className="font-mono text-2xl font-bold tracking-wider">{p.get("code")}</div>
          <div className="text-xs text-ink-500">Keep this to check your application status.</div>
        </div>
        <Stepper current={1} />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/careers/status?code=ZF-7K2Q9" className="btn btn-primary">Track an application</Link>
          <Link to="/careers" className="btn btn-secondary">See other roles</Link>
        </div>
        <p className="mt-3 text-xs text-ink-500">Prototype: tracking opens a sample application (ZF-7K2Q9).</p>
      </div>
    </div>
  );
}

export function Status() {
  const { applications, changeStage } = useStore();
  const { toast, confirm } = useFeedback();
  const [p, setP] = useSearchParams();
  const code = p.get("code") ?? "";
  const [text, setText] = useState(code);
  const a = code ? applications.find((x) => x.trackingCode.toLowerCase() === code.trim().toLowerCase()) : undefined;
  const current = !a ? 1 : a.stage === "Interview" ? 2 : ["Offer", "Hired", "Rejected", "Withdrawn"].includes(a.stage) ? 3 : 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Track your application</h1>
      <p className="mb-5 mt-1 text-ink-500">Enter the tracking code from your confirmation email. Try <code className="rounded bg-ink-100 px-1">ZF-7K2Q9</code> or <code className="rounded bg-ink-100 px-1">ZF-5Q3E1</code>.</p>
      <form className="card mb-5 flex gap-2 p-3" onSubmit={(e) => { e.preventDefault(); setP(text ? { code: text } : {}); }}>
        <input className="input" placeholder="e.g. ZF-7K2Q9" value={text} onChange={(e) => setText(e.target.value)} aria-label="Tracking code" required maxLength={20} />
        <button className="btn btn-primary">Check status</button>
      </form>
      {code && !a && <Callout tone="warning">We couldn't find an application with that code. Check the code in your confirmation email.</Callout>}
      {a && (<>
        <section className="card mb-4">
          <div className="card-head"><div><h2 className="card-title">{a.job.title}</h2><div className="card-sub">{company.name} · applied {fmtDate(a.appliedOn)}</div></div><Badge tone="brand">{candidateStatus(a.stage)}</Badge></div>
          <div className="p-5">
            <Stepper current={current} />
            {a.stage === "InfoRequested" && <Callout tone="info" className="mt-5"><strong>The hiring team asked for more information.</strong> {a.stageReason}. <button className="font-medium underline" onClick={() => toast("Secure upload form opens here in the full build.", "info")}>Add information</button></Callout>}
            <p className="mt-5 text-sm text-ink-500">We'll email you when your status changes. Internal notes and screening scores aren't shared, and a person reviews every application.</p>
          </div>
        </section>
        <section className="card p-5">
          <div className="mb-2 text-sm font-semibold">Your data</div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => toast("Correction request sent to the hiring team (prototype).", "info")}>Request correction</button>
            {!["Withdrawn", "Hired", "Rejected"].includes(a.stage) && (
              <button className="btn btn-secondary btn-sm" onClick={async () => { if (await confirm({ title: "Withdraw application?", message: "This ends your application for this role. You can still apply to other roles.", ok: "Withdraw", danger: true })) { changeStage(a.id, "Withdrawn", "Withdrawn by candidate"); toast("Application withdrawn."); } }}>Withdraw</button>
            )}
            <button className="btn btn-secondary btn-sm text-rose-700" onClick={async () => { if (await confirm({ title: "Request data deletion?", message: "We'll verify your identity by email, then delete your resume and personal data from this company's records.", ok: "Send request", danger: true })) toast("Deletion request received. Check your email to confirm (prototype)."); }}>Delete my data</button>
          </div>
        </section>
      </>)}
    </div>
  );
}
