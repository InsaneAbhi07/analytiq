import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3, Briefcase, Building2, CalendarDays, Cpu, Eye, FileText, GitCompare, HelpCircle, MailCheck, PencilLine, Quote, ShieldCheck, Slash, UserCheck,
} from "lucide-react";
import { useStore } from "../data/store";
import { ScoreRing } from "../components/ui";
import { PlanCards } from "./Billing";

export default function Landing() {
  const { applications } = useStore();
  const navigate = useNavigate();
  // Product preview uses the real computed scores from the mock data.
  const preview = applications.filter((a) => a.jobId === 1 && a.screening).sort((a, b) => b.screening!.score - a.screening!.score).slice(0, 3);
  const top = preview[0];
  const efEvidence = top?.screening?.requiredMatched.find((m) => m.skill === "Entity Framework Core");

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-ai-100/80 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700">Applicant tracking + explainable AI screening</div>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight md:text-[3.4rem]">
              Hire on <span className="bg-gradient-to-r from-brand-600 to-ai-500 bg-clip-text text-transparent">evidence</span>, not guesswork.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-600">Analytiq collects applications, reads every resume and shows recruiters exactly which job requirements each candidate meets, quoting the evidence from the resume. Your team makes every decision.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/app" className="btn btn-primary btn-lg">Explore the demo workspace</Link>
              <Link to="/careers" className="btn btn-secondary btn-lg">See a careers page</Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-500"><Cpu size={15} /> Runs on local open-source models. Resumes are never sent to paid AI APIs.</p>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-ink-50/80 p-3 shadow-[0_30px_60px_-20px_rgba(37,17,98,.35)] backdrop-blur">
            <div className="card mb-2">
              <div className="card-head"><strong className="text-sm">Senior .NET Developer · screening</strong><span className="text-xs text-ink-500">ranked by match</span></div>
              {preview.map((a) => (
                <button key={a.id} onClick={() => navigate(`/app/candidates/${a.id}`)} className="flex w-full items-center gap-3 border-b border-ink-100 px-4 py-3 text-left last:border-0 hover:bg-ink-50">
                  <ScoreRing score={a.screening!.score} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{a.candidate.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1">{a.screening!.requiredMatched.slice(0, 3).map((m) => <span key={m.skill} className={m.type === "Exact" ? "chip chip-match" : "chip chip-semantic"}>{m.skill}</span>)}</div>
                  </div>
                  <span className="chip">Review →</span>
                </button>
              ))}
            </div>
            {efEvidence && (
              <div className="flex gap-2.5 rounded-xl border border-ai-100 bg-ai-50 p-3 text-[0.83rem] text-ai-700">
                <Quote size={16} className="mt-0.5 shrink-0" />
                <span><strong>Evidence for “{efEvidence.skill}”:</strong> “{efEvidence.evidence}” · {efEvidence.section}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-600">The whole hiring lifecycle</div>
        <h2 className="mb-8 text-3xl font-bold">From job post to joining date, in one place.</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Briefcase, "Jobs & careers page", "Publish roles to a branded, mobile-friendly careers page with a unique link per job."],
            [FileText, "Resume parsing", "PDF and DOCX resumes parsed in the background into skills, experience, education and projects."],
            [GitCompare, "Explainable matching", "A 0–100 score with the matching skills, missing evidence and the exact resume lines behind it."],
            [UserCheck, "Human-in-the-loop", "Shortlist, hold or reject with recorded reasons. Nothing is ever rejected automatically."],
            [CalendarDays, "Interviews & feedback", "Schedule rounds, assign panels and collect structured, evidence-based feedback."],
            [MailCheck, "Offers", "Track offers from draft to joining, with compensation visible only to authorised roles."],
            [BarChart3, "Analytics", "Funnel, time-to-hire, source and department reports with small-sample warnings built in."],
            [Building2, "Multi-tenant & secure", "Every company's data is isolated. Resumes are stored privately and downloads are audited."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Briefcase;
            return (
              <div key={t as string} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-pop">
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-ai-50 text-brand-600"><I size={19} /></span>
                <h3 className="mb-1 font-semibold">{t as string}</h3>
                <p className="text-sm text-ink-500">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="responsible-ai" className="border-y border-ink-200 bg-ink-950 py-16 text-ink-300">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-ai-500">Responsible AI by design</div>
            <h2 className="text-3xl font-bold text-white">AI that assists recruiters, and never replaces them.</h2>
            <p className="mt-3">Scores are a sorting aid with configurable weights, not a verdict on a person. When something can't be read reliably from a resume, Analytiq says so instead of guessing.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Slash, "Never uses name, photo, gender, age, religion, caste or location"],
              [Eye, "Every match shows its resume evidence"],
              [HelpCircle, "Distinguishes missing evidence from a missing skill"],
              [ShieldCheck, "Ignores instructions hidden inside resumes"],
              [PencilLine, "Recruiters can override, and must give a reason"],
              [Cpu, "Local models with no third-party AI calls by default"],
            ].map(([Icon, t]) => {
              const I = Icon as typeof Eye;
              return <div key={t as string} className="flex gap-3 text-sm"><I size={18} className="mt-0.5 shrink-0 text-ai-500" /><span>{t as string}</span></div>;
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-600">Pricing</div>
          <h2 className="text-3xl font-bold">Plans that grow with your hiring.</h2>
          <p className="mt-2 text-ink-500">14-day free trial on every plan. No card required.</p>
        </div>
        <PlanCards onPick={() => navigate("/register")} />
      </section>
    </>
  );
}
