import type { InterviewStatus, JobStatus, OfferStatus, ProcessingStatus, Stage } from "../data/types";

export type Tone = "neutral" | "brand" | "info" | "success" | "warning" | "danger" | "violet" | "teal";

export const STAGES: Stage[] = ["New", "Screening", "Shortlisted", "OnHold", "InfoRequested", "Interview", "Offer", "Hired", "Rejected", "Withdrawn"];

export const stageLabel = (s: Stage) =>
  ({ New: "New", Screening: "In screening", Shortlisted: "Shortlisted", OnHold: "On hold", InfoRequested: "Info requested", Interview: "Interview", Offer: "Offer", Hired: "Hired", Rejected: "Rejected", Withdrawn: "Withdrawn" })[s];

export const stageTone = (s: Stage): Tone =>
  ({ New: "neutral", Screening: "info", Shortlisted: "brand", OnHold: "warning", InfoRequested: "warning", Interview: "violet", Offer: "teal", Hired: "success", Rejected: "danger", Withdrawn: "neutral" } as const)[s];

/** Candidate-facing wording: no internal notes or scores. */
export const candidateStatus = (s: Stage) =>
  ({ New: "Under review", Screening: "Under review", Shortlisted: "Under review", OnHold: "Under review", InfoRequested: "Action needed — more information requested", Interview: "Interview stage", Offer: "Offer stage", Hired: "Hired", Rejected: "Not progressing", Withdrawn: "Withdrawn" })[s];

export const processingLabel = (p: ProcessingStatus) => (p === "NeedsReview" ? "Needs review" : p);
export const processingTone = (p: ProcessingStatus): Tone =>
  ({ Queued: "neutral", Processing: "info", Completed: "success", NeedsReview: "warning", Failed: "danger" } as const)[p];

export const jobTone = (s: JobStatus): Tone => ({ Published: "success", Draft: "neutral", Paused: "warning", Closed: "danger" } as const)[s];
export const interviewTone = (s: InterviewStatus): Tone => ({ Scheduled: "info", Completed: "success", NoShow: "warning", Cancelled: "danger" } as const)[s];
export const interviewLabel = (s: InterviewStatus) => (s === "NoShow" ? "No-show" : s);
export const offerTone = (s: OfferStatus): Tone => ({ Draft: "neutral", Sent: "info", Accepted: "teal", Declined: "danger", Joined: "success" } as const)[s];

export const tenantTone = (s: string): Tone => (({ Active: "success", Trial: "info", Suspended: "warning", Deactivated: "danger" } as Record<string, Tone>)[s] ?? "neutral");
export const severityTone = (s: string): Tone => (s === "High" ? "danger" : s === "Warning" ? "warning" : "neutral");

/** Low scores use neutral grey on purpose: a low match means missing evidence, not a verdict. */
export const scoreBand = (n: number) => (n >= 75 ? "high" : n >= 50 ? "mid" : "low");

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export function ago(d: Date) {
  const mins = (Date.now() - d.getTime()) / 6e4;
  if (mins < 1) return "just now";
  if (mins < 60) return `${Math.floor(mins)} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)} h ago`;
  if (mins < 43200) return `${Math.floor(mins / 1440)} d ago`;
  return fmtDate(d);
}

export const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const fmtShort = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
export const fmtTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
export const fmtDateTime = (d: Date) => `${fmtShort(d)}, ${fmtTime(d)}`;
export const inr = (n: number, decimals = 0) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
export const daysUntil = (d: Date) => Math.round((d.getTime() - Date.now()) / 864e5);
