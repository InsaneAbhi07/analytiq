import { useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { CalendarDays, MapPin, Phone, Video } from "lucide-react";
import { interviews } from "../data/seed";
import { useStore } from "../data/store";
import { useFeedback } from "../components/feedback";
import { Avatar, Badge, EmptyState, PageHeader } from "../components/ui";
import { fmtTime, initials, interviewLabel, interviewTone } from "../lib/ui";
import type { Interview } from "../data/types";

export default function Interviews() {
  const { applications } = useStore();
  const { toast } = useFeedback();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const now = Date.now();
  const upcoming = interviews.filter((i) => i.status === "Scheduled" && +i.startsAt > now - 2 * 36e5).sort((a, b) => +a.startsAt - +b.startsAt);
  const past = interviews.filter((i) => !upcoming.includes(i)).sort((a, b) => +b.startsAt - +a.startsAt);
  const list = tab === "upcoming" ? upcoming : past;

  const groups = list.reduce<Record<string, Interview[]>>((g, i) => {
    const d = new Date(i.startsAt); d.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((+d - +today) / 864e5);
    const key = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
    (g[key] ??= []).push(i);
    return g;
  }, {});

  const icon = (t: Interview["type"]) => (t === "Video" ? <Video size={14} /> : t === "Phone" ? <Phone size={14} /> : <MapPin size={14} />);

  return (
    <>
      <PageHeader title="Interviews" subtitle={`${upcoming.length} upcoming · ${past.filter((i) => i.status === "Completed").length} completed · times in IST`}
        actions={<Link to="/app/interviews/schedule" className="btn btn-primary"><CalendarDays size={15} /> Schedule interview</Link>} />
      <div className="card overflow-hidden">
        <div className="flex gap-1 border-b border-ink-200 px-3">
          {(["upcoming", "past"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} className={clsx("border-b-2 px-3 py-2.5 text-sm font-medium capitalize", tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900")}>
              {k} ({(k === "upcoming" ? upcoming : past).length})
            </button>
          ))}
        </div>
        {list.length === 0 && <EmptyState icon={<CalendarDays size={20} />} title="Nothing here" />}
        {Object.entries(groups).map(([label, items]) => (
          <div key={label}>
            <div className="border-b border-ink-100 bg-ink-50/70 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-500">{label}</div>
            {items.map((i) => {
              const a = applications.find((x) => x.id === i.applicationId)!;
              return (
                <div key={i.id} className="flex flex-wrap items-center gap-4 border-b border-ink-100 px-5 py-3.5 last:border-0">
                  <div className="w-20 font-semibold tabular-nums">{fmtTime(i.startsAt)}<div className="text-xs font-normal text-ink-500">{i.duration} min</div></div>
                  <div className="min-w-[200px] flex-1">
                    <Link to={`/app/candidates/${a.id}`} className="font-medium hover:text-brand-700">{a.candidate.name}</Link>
                    <div className="text-xs text-ink-500">Round {i.round} · {i.title} · {a.job.title}</div>
                  </div>
                  <div className="hidden min-w-[180px] items-center gap-1.5 text-xs text-ink-500 md:flex">{icon(i.type)}{i.location}</div>
                  <div className="hidden -space-x-2 sm:flex" title={i.interviewers.join(", ")}>
                    {i.interviewers.map((n) => <span key={n} className="rounded-full ring-2 ring-white"><Avatar name={n} initials={initials(n)} size="sm" /></span>)}
                  </div>
                  <Badge tone={interviewTone(i.status)} className="min-w-[84px] justify-center">{interviewLabel(i.status)}</Badge>
                  {i.status === "Scheduled" && i.type === "Video" && <button className="btn btn-secondary btn-sm" onClick={() => toast("Opens the meeting link in the full build.", "info")}>Join</button>}
                  {i.status !== "Cancelled" && <Link to={`/app/interviews/${i.id}/feedback`} className="btn btn-ghost btn-sm">{i.feedback ? "Feedback" : "Record feedback"}</Link>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
