import { useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import { Cloud, Cpu, CreditCard, HardDrive, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { company, departments, jobs, subscription, team } from "../data/seed";
import { SEMANTIC_THRESHOLD, WEIGHTS } from "../data/scoring";
import { useFeedback } from "../components/feedback";
import { Avatar, Badge, Callout, Modal, PageHeader } from "../components/ui";
import { initials, type Tone } from "../lib/ui";

const TABS = [["company", "Company profile"], ["team", "Team & roles"], ["departments", "Departments"], ["screening", "Screening"], ["privacy", "Privacy & retention"], ["integrations", "Integrations"]] as const;
type Tab = (typeof TABS)[number][0];

function SaveBar({ label = "Save changes" }: { label?: string }) {
  return <div className="flex justify-end rounded-b-xl border-t border-ink-100 bg-ink-50/70 px-5 py-3"><button className="btn btn-primary">{label}</button></div>;
}

function Toggle({ id, label, defaultChecked, disabled, children }: { id: string; label: string; defaultChecked?: boolean; disabled?: boolean; children?: ReactNode }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-start gap-3 py-1.5">
      <button type="button" id={id} role="switch" aria-checked={on} disabled={disabled} onClick={() => setOn(!on)}
        className={clsx("relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition disabled:opacity-50", on ? "bg-brand-600" : "bg-ink-300")}>
        <span className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
      </button>
      <label htmlFor={id} className="text-sm">{label} {children}</label>
    </div>
  );
}

export default function Settings() {
  const { toast, confirm } = useFeedback();
  const [p, setP] = useSearchParams();
  const tab = (p.get("tab") as Tab) ?? "company";
  const [weights, setWeights] = useState({ required: WEIGHTS.required, preferred: WEIGHTS.preferred, experience: WEIGHTS.experience });
  const [invite, setInvite] = useState(false);
  const total = weights.required + weights.preferred + weights.experience;

  const save = (e: FormEvent) => { e.preventDefault(); toast("Settings saved (prototype, not persisted)."); };

  return (
    <>
      <PageHeader title="Settings" subtitle={`Company-wide configuration for ${company.name}.`} />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-ink-200" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setP({ tab: k })}
            className={clsx("whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium", tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900")}>{l}</button>
        ))}
      </div>

      {tab === "company" && (
        <form className="card" onSubmit={save}>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div><label className="label req" htmlFor="cn">Company name</label><input id="cn" className="input" defaultValue={company.name} required /></div>
            <div><label className="label" htmlFor="ind">Industry</label><input id="ind" className="input" defaultValue={company.industry} /></div>
            <div><label className="label req" htmlFor="em">Business email</label><input id="em" className="input" type="email" defaultValue={company.email} required /></div>
            <div><label className="label" htmlFor="city">Head office city</label><input id="city" className="input" defaultValue={company.city} /></div>
            <div><label className="label" htmlFor="gst">GSTIN <span className="font-normal text-ink-500">(for invoices)</span></label><input id="gst" className="input" placeholder="29ABCDE1234F1Z5" /></div>
            <div><label className="label" htmlFor="slug">Careers page URL</label>
              <div className="flex"><span className="rounded-l-lg border border-r-0 border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-500">careers.analytiq.app/</span><input id="slug" className="input rounded-l-none" defaultValue={company.slug} /></div></div>
            <div className="md:col-span-2"><label className="label" htmlFor="about">About the company <span className="font-normal text-ink-500">(shown on careers page)</span></label>
              <textarea id="about" className="input" rows={3} defaultValue="Zenith Fintech builds reconciliation and payments infrastructure for Indian banks and NBFCs." /></div>
          </div>
          <SaveBar />
        </form>
      )}

      {tab === "team" && (<>
        <section className="card overflow-hidden">
          <div className="card-head">
            <div><h2 className="card-title">Team members</h2><div className="card-sub">{subscription.usage[2].used} of {subscription.usage[2].limit} recruiter seats used · interviewers don't use a seat</div></div>
            <button className="btn btn-primary btn-sm" onClick={() => setInvite(true)}><UserPlus size={15} /> Invite</button>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Status</th><th /></tr></thead>
              <tbody>
                {team.map((u, i) => (
                  <tr key={u.name}>
                    <td><div className="flex items-center gap-2.5"><Avatar name={u.name} initials={initials(u.name)} /><div><div className="font-medium">{u.name}{i === 0 && " (you)"}</div><div className="text-xs text-ink-500">{u.name.toLowerCase().replace(/[^a-z ]/g, "").replace(" ", ".")}@zenithfintech.example</div></div></div></td>
                    <td><select className="input w-auto py-1.5" defaultValue={u.role} disabled={i === 0} aria-label={`Role for ${u.name}`} onChange={(e) => toast(`Role changed to ${e.target.value}. Logged in the audit trail (prototype).`)}>
                      {["Company Admin", "Recruiter", "Interviewer"].map((r) => <option key={r}>{r}</option>)}</select></td>
                    <td className="text-sm">{u.dept}</td>
                    <td><Badge tone={u.name.startsWith("Leena") ? "neutral" : "success"}>{u.name.startsWith("Leena") ? "Invited" : "Active"}</Badge></td>
                    <td className="text-right">{i > 0 && <button className="btn btn-ghost btn-sm text-rose-700" onClick={async () => { if (await confirm({ title: "Deactivate user?", message: `${u.name} loses access immediately. Their past actions stay in the audit log.`, ok: "Deactivate", danger: true })) toast("User deactivated (prototype)."); }}>Deactivate</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[["Company Admin", "Everything in the workspace, including billing, team, settings and compensation data."],
            ["Recruiter", "Jobs, candidates, screening, interviews and offers for permitted jobs. Can export authorised reports."],
            ["Interviewer", "Only assigned interviews: candidate name, resume, job details and feedback. No scores, notes or salary."]].map(([r, d]) => (
            <div key={r} className="card p-4"><div className="mb-1 font-semibold">{r}</div><p className="text-sm text-ink-500">{d}</p></div>
          ))}
        </div>
        <Modal open={invite} onClose={() => setInvite(false)} title="Invite a team member">
          <form onSubmit={(e) => { e.preventDefault(); setInvite(false); toast("Invite sent. They'll set their own password via a one-time link (prototype)."); }} className="space-y-3">
            <div><label className="label req" htmlFor="inv-em">Work email</label><input id="inv-em" className="input" type="email" required placeholder="name@zenithfintech.example" /></div>
            <div><label className="label" htmlFor="inv-role">Role</label><select id="inv-role" className="input"><option>Recruiter</option><option>Interviewer</option><option>Company Admin</option></select></div>
            <div className="flex justify-end gap-2 pt-2"><button type="button" className="btn btn-secondary" onClick={() => setInvite(false)}>Cancel</button><button className="btn btn-primary">Send invite</button></div>
          </form>
        </Modal>
      </>)}

      {tab === "departments" && (
        <section className="card overflow-hidden">
          <div className="card-head"><h2 className="card-title">Departments &amp; hiring teams</h2><button className="btn btn-primary btn-sm" onClick={() => toast("Add-department form opens here in the full build.", "info")}>Add department</button></div>
          <table className="tbl">
            <thead><tr><th>Department</th><th>Head / hiring manager</th><th className="text-right">Open jobs</th><th className="text-right">All jobs</th></tr></thead>
            <tbody>{departments.map((d) => (
              <tr key={d}><td className="font-medium">{d}</td><td>{jobs.find((j) => j.department === d)?.hiringManager ?? "—"}</td>
                <td className="text-right tabular-nums">{jobs.filter((j) => j.department === d && j.status === "Published").length}</td>
                <td className="text-right tabular-nums">{jobs.filter((j) => j.department === d).length}</td></tr>
            ))}</tbody>
          </table>
        </section>
      )}

      {tab === "screening" && (
        <form onSubmit={(e) => { e.preventDefault(); if (total !== 100) return toast("Weights must add up to 100%.", "warning"); save(e); }} className="grid gap-4 lg:grid-cols-12">
          <section className="card lg:col-span-7">
            <div className="card-head"><div><h2 className="card-title">Default scoring weights</h2><div className="card-sub">Used for new jobs. Each screening records the configuration version it used.</div></div></div>
            <div className="space-y-4 p-5">
              {(["required", "preferred", "experience"] as const).map((k) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm"><label htmlFor={`w-${k}`} className="font-medium capitalize">{k === "experience" ? "Relevant experience" : `${k} skills`}</label><span className="font-semibold tabular-nums">{weights[k]}%</span></div>
                  <input id={`w-${k}`} type="range" min={0} max={100} step={5} value={weights[k]} onChange={(e) => setWeights((w) => ({ ...w, [k]: Number(e.target.value) }))} className="w-full accent-brand-600" />
                </div>
              ))}
              <div className="flex justify-between border-t border-ink-100 pt-3 text-sm"><span className="font-medium">Total</span><span className={clsx("font-semibold tabular-nums", total !== 100 && "text-rose-600")}>{total}%</span></div>
              {total !== 100 && <Callout tone="warning">Weights must add up to 100%.</Callout>}
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="label" htmlFor="sem">Credit for related (semantic) skills</label><select id="sem" className="input" defaultValue="70"><option value="50">50%</option><option value="70">70%</option><option value="85">85%</option><option value="0">Don't count</option></select></div>
                <div><label className="label" htmlFor="th">Similarity threshold</label><input id="th" className="input" type="number" step="0.05" min="0.5" max="0.95" defaultValue={SEMANTIC_THRESHOLD} /></div>
              </div>
              <p className="text-xs text-ink-500">These are configurable product defaults, not validated measures of candidate quality.</p>
            </div>
            <SaveBar label="Save screening settings" />
          </section>
          <div className="space-y-4 lg:col-span-5">
            <section className="card p-5">
              <h2 className="mb-2 flex items-center gap-2 font-semibold"><ShieldCheck size={17} className="text-emerald-600" /> Safeguards (always on)</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-600">
                <li>No automatic rejection based on scores.</li>
                <li>Rejections and overrides require a recorded reason.</li>
                <li>Name, photo, gender, age, religion, caste, marital status and location are excluded from scoring.</li>
                <li>Instructions embedded in resumes are ignored.</li>
                <li>Unknown criteria are excluded, never guessed.</li>
              </ul>
            </section>
            <section className="card p-5">
              <h2 className="mb-1 font-semibold">AI processing</h2>
              <Toggle id="t-auto" label="Screen new applications automatically (1 credit each)" defaultChecked />
              <Toggle id="t-ocr" label="OCR for scanned resumes"><span className="text-ink-500">(needs Tesseract on the AI host)</span></Toggle>
              <Toggle id="t-jd" label="AI job-description drafts" disabled><Badge>Professional plan</Badge></Toggle>
            </section>
          </div>
        </form>
      )}

      {tab === "privacy" && (
        <form className="card" onSubmit={save}>
          <div className="card-head"><div><h2 className="card-title">Candidate data retention</h2><div className="card-sub">Configure to meet your obligations under applicable law (e.g. the DPDP Act, 2023). Get legal advice where needed.</div></div></div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div><label className="label" htmlFor="r1">Delete unsuccessful candidates' data after</label><select id="r1" className="input" defaultValue="12"><option value="6">6 months</option><option value="12">12 months</option><option value="24">24 months</option></select></div>
            <div><label className="label" htmlFor="r2">Delete hired candidates' resume files after</label><select id="r2" className="input" defaultValue="12"><option value="1">Move to HR system, then 30 days</option><option value="12">12 months</option></select></div>
            <div className="md:col-span-2"><label className="label" htmlFor="pn">Privacy notice shown on the application form</label>
              <textarea id="pn" className="input" rows={4} defaultValue="We use the information you provide only to assess your application for this role and to contact you about it. An automated tool helps recruiters review applications; a person makes every hiring decision. You can request access, correction or deletion of your data at any time." /></div>
            <div className="md:col-span-2"><Toggle id="t-pool" label="Ask candidates for separate, optional consent to keep their profile for future roles" /></div>
          </div>
          <SaveBar label="Save privacy settings" />
        </form>
      )}

      {tab === "integrations" && (
        <div className="grid gap-4 md:grid-cols-2">
          {([
            [Cpu, "Local AI service", "Connected", "success", "FastAPI service · all-MiniLM-L6-v2 · health check passed 2 min ago"],
            [Mail, "Email delivery (SMTP)", "Not configured", "warning", "Interview invites and candidate emails are queued but not sent until SMTP is configured."],
            [CreditCard, "Payment gateway", "Demo mode", "warning", "No gateway credentials configured. Billing runs in clearly labelled demo mode."],
            [Cloud, "External AI provider", "Disabled", "neutral", "Optional and off by default. No resume data is sent unless an admin explicitly allows it per feature."],
            [HardDrive, "Resume storage", "Private local storage", "success", "Stored outside the web root. Object-storage adapter available for production."],
          ] as [typeof Cpu, string, string, Tone, string][]).map(([Icon, name, status, tone, desc]) => (
            <div key={name} className="card flex gap-4 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon size={19} /></span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2"><strong>{name}</strong><Badge tone={tone}>{status}</Badge></div>
                <p className="mt-1 text-sm text-ink-500">{desc}</p>
                <button className="btn btn-secondary btn-sm mt-3" onClick={() => toast("Configuration panel opens here in the full build.", "info")}>Configure</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
