import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FileText, Lock, Plus } from "lucide-react";
import { offers as seedOffers } from "../data/seed";
import { offerFor, useStore } from "../data/store";
import { useFeedback } from "../components/feedback";
import { Avatar, Badge, Modal, PageHeader } from "../components/ui";
import { fmtDate, initials, offerTone } from "../lib/ui";
import type { Offer, OfferStatus } from "../data/types";

export default function Offers() {
  const { applications, changeStage } = useStore();
  const { toast, confirm } = useFeedback();
  const [offers, setOffers] = useState<Offer[]>(seedOffers);
  const [open, setOpen] = useState(false);
  const eligible = applications.filter((a) => a.stage === "Interview" && !offerFor(a.id) && !offers.some((o) => o.applicationId === a.id));

  const update = async (o: Offer, to: OfferStatus, opts: { title: string; message: string; reason?: boolean; danger?: boolean }) => {
    const res = await confirm({ ...opts, ok: opts.title.replace("?", "") });
    if (!res) return;
    setOffers((list) => list.map((x) => (x.id === o.id ? { ...x, status: to, sentOn: to === "Sent" ? new Date() : x.sentOn } : x)));
    if (to === "Joined") changeStage(o.applicationId, "Hired", res.reason || "Joining confirmed");
    if (to === "Declined") changeStage(o.applicationId, "Withdrawn", res.reason || "Offer declined");
    toast(`Offer marked as ${to}.`);
  };

  const create = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const appId = Number(f.get("app"));
    setOffers((list) => [...list, { id: Date.now(), applicationId: appId, designation: String(f.get("designation")), ctcLakh: Number(f.get("ctc")), joining: new Date(String(f.get("joining"))), status: "Draft", preparedBy: "Abhishek Singh" }]);
    changeStage(appId, "Offer");
    setOpen(false);
    toast("Offer draft created and candidate moved to Offer stage.");
  };

  return (
    <>
      <PageHeader title="Offers" subtitle="Compensation is visible to Company Admins and Recruiters only. Acceptance is shown only once it's recorded."
        actions={<button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Prepare offer</button>} />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {(["Draft", "Sent", "Accepted", "Declined", "Joined"] as OfferStatus[]).map((s) => (
          <div key={s} className="card p-4"><Badge tone={offerTone(s)}>{s}</Badge><div className="mt-2 font-display text-2xl font-bold tabular-nums">{offers.filter((o) => o.status === s).length}</div></div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Candidate</th><th>Designation</th><th className="text-right">Annual CTC</th><th>Joining</th><th>Sent</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {offers.map((o) => {
                const a = applications.find((x) => x.id === o.applicationId)!;
                return (
                  <tr key={o.id}>
                    <td><div className="flex items-center gap-2.5"><Avatar name={a.candidate.name} initials={initials(a.candidate.name)} /><div><Link to={`/app/candidates/${a.id}`} className="font-medium hover:text-brand-700">{a.candidate.name}</Link><div className="text-xs text-ink-500">{a.job.title}</div></div></div></td>
                    <td>{o.designation}</td>
                    <td className="whitespace-nowrap text-right tabular-nums"><Lock size={12} className="mr-1 inline text-ink-400" />₹{o.ctcLakh} LPA</td>
                    <td className="text-sm">{fmtDate(o.joining)}</td>
                    <td className="text-sm text-ink-500">{o.sentOn ? fmtDate(o.sentOn) : "—"}</td>
                    <td><Badge tone={offerTone(o.status)}>{o.status}</Badge></td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {o.status === "Draft" && <button className="btn btn-secondary btn-sm" onClick={() => update(o, "Sent", { title: "Send offer?", message: "The offer letter is emailed to the candidate with a secure response link." })}>Send</button>}
                        {o.status === "Sent" && <>
                          <button className="btn btn-secondary btn-sm" onClick={() => update(o, "Accepted", { title: "Record acceptance?", message: "Only record acceptance once you have it in writing from the candidate.", reason: true })}>Accepted</button>
                          <button className="btn btn-secondary btn-sm text-rose-700" onClick={() => update(o, "Declined", { title: "Record decline?", message: "Record that the candidate declined this offer.", reason: true, danger: true })}>Declined</button>
                        </>}
                        {o.status === "Accepted" && <button className="btn btn-secondary btn-sm" onClick={() => update(o, "Joined", { title: "Confirm joining?", message: "The candidate is marked as Hired." })}>Confirm joining</button>}
                        <button className="btn btn-ghost btn-sm" onClick={() => toast("Offer letter PDF downloads here in the full build.", "info")} aria-label="Offer letter"><FileText size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Prepare offer" wide>
        <form onSubmit={create} className="grid gap-4 md:grid-cols-6">
          <div className="md:col-span-6">
            <label className="label req" htmlFor="o-app">Candidate</label>
            <select id="o-app" name="app" className="input" required defaultValue="">
              <option value="">Select…</option>
              {eligible.map((a) => <option key={a.id} value={a.id}>{a.candidate.name} · {a.job.title}</option>)}
            </select>
            <p className="mt-1 text-xs text-ink-500">Only candidates at the Interview stage without an existing offer are listed.</p>
          </div>
          <div className="md:col-span-3"><label className="label req" htmlFor="o-d">Designation</label><input id="o-d" name="designation" className="input" required /></div>
          <div className="md:col-span-1"><label className="label req" htmlFor="o-c">CTC (₹ lakh)</label><input id="o-c" name="ctc" className="input" type="number" step="0.1" min="0" required /></div>
          <div className="md:col-span-2"><label className="label req" htmlFor="o-j">Proposed joining</label><input id="o-j" name="joining" className="input" type="date" required /></div>
          <div className="flex justify-end gap-2 md:col-span-6"><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary">Save draft</button></div>
        </form>
      </Modal>
    </>
  );
}
