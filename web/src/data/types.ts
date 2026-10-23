export type JobStatus = "Draft" | "Published" | "Paused" | "Closed";
export type ProcessingStatus = "Queued" | "Processing" | "Completed" | "NeedsReview" | "Failed";
export type Stage =
  | "New" | "Screening" | "Shortlisted" | "OnHold" | "InfoRequested"
  | "Interview" | "Offer" | "Hired" | "Rejected" | "Withdrawn";
export type InterviewStatus = "Scheduled" | "Completed" | "NoShow" | "Cancelled";
export type OfferStatus = "Draft" | "Sent" | "Accepted" | "Declined" | "Joined";

export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  workMode: "On-site" | "Hybrid" | "Remote";
  employmentType: string;
  status: JobStatus;
  openings: number;
  minExp: number;
  maxExp: number;
  required: string[];
  preferred: string[];
  education: string;
  deadline: Date;
  createdOn: Date;
  hiringManager: string;
  recruiter: string;
  summary: string;
  responsibilities: string[];
  salary: string;
}

export interface WorkEntry { role: string; company: string; period: string; summary: string }

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  experience: number | null;
  skills: string[];
  education: string[];
  certifications: string[];
  work: WorkEntry[];
  projects: string[];
  links?: string[];
  resumeFile: string;
  resumeKb: number;
  parsingConfidence: number | null;
  warnings?: string[];
}

export interface SkillMatch {
  skill: string;
  type: "Exact" | "Semantic";
  term: string;
  similarity: number;
  section: string;
  evidence: string;
}

export interface ScoreComponent {
  name: string;
  weight: number;
  fraction: number | null; // null = could not be assessed
  detail: string;
}

export interface Screening {
  score: number;
  requiredMatched: SkillMatch[];
  requiredMissing: string[];
  preferredMatched: SkillMatch[];
  preferredMissing: string[];
  components: ScoreComponent[];
  warnings: string[];
  modelVersion: string;
  configVersion: string;
  screenedOn: Date;
}

export interface HistoryEvent {
  on: Date;
  title: string;
  by: string;
  reason?: string;
  kind: "info" | "muted" | "ai" | "primary" | "success" | "warning" | "danger";
}

export interface Note { on: Date; by: string; text: string }

export interface Application {
  id: number;
  candidateId: number;
  jobId: number;
  appliedOn: Date;
  source: string;
  processing: ProcessingStatus;
  processingError?: string;
  stage: Stage;
  recruiter: string;
  stageReason?: string;
  trackingCode: string;
  screening: Screening | null;
  history: HistoryEvent[];
  notes: Note[];
}

export interface Feedback {
  by: string;
  technical: number;
  problemSolving: number;
  communication: number;
  roleKnowledge: number;
  recommendation: string;
  evidence: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  round: number;
  title: string;
  type: "Video" | "On-site" | "Phone";
  startsAt: Date;
  duration: number;
  location: string;
  interviewers: string[];
  status: InterviewStatus;
  feedback?: Feedback;
}

export interface Offer {
  id: number;
  applicationId: number;
  designation: string;
  ctcLakh: number;
  joining: Date;
  sentOn?: Date;
  status: OfferStatus;
  preparedBy: string;
}

export interface Plan {
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  jobs: string;
  credits: string;
  seats: string;
  storage: string;
  features: string[];
  highlight?: boolean;
}
