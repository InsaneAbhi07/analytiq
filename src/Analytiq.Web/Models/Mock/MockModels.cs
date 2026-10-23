namespace Analytiq.Web.Models.Mock;

// UI-prototype models. These mirror the planned domain entities closely enough that
// the views can later be bound to EF Core entities / DTOs with minimal changes.

public enum JobStatus { Draft, Published, Paused, Closed }

public enum ProcessingStatus { Uploaded, Queued, Processing, Completed, NeedsReview, Failed }

public enum ApplicationStage { New, Screening, Shortlisted, OnHold, InfoRequested, Interview, Offer, Hired, Rejected, Withdrawn }

public enum InterviewStatus { Scheduled, Completed, NoShow, Cancelled }

public enum OfferStatus { Draft, Sent, Accepted, Declined, Joined }

public enum SkillMatchType { Exact, Semantic }

public class Company
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Industry { get; init; } = "";
    public string Email { get; init; } = "";
    public string City { get; init; } = "";
    public string Plan { get; init; } = "";
    public string Status { get; init; } = "Active";
    public int Users { get; init; }
    public int ActiveJobs { get; init; }
    public int CreditsUsed { get; init; }
    public int CreditsLimit { get; init; }
    public DateTime CreatedOn { get; init; }
    public string Slug { get; init; } = "";
}

public class TeamUser
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Email { get; init; } = "";
    public string Role { get; init; } = "";
    public string Department { get; init; } = "";
    public string Status { get; init; } = "Active";
    public DateTime? LastActive { get; init; }
    public string Initials => string.Concat(Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(2).Select(p => p[0]));
}

public class Department
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Head { get; init; } = "";
    public int Members { get; init; }
}

public class Job
{
    public int Id { get; init; }
    public string Title { get; init; } = "";
    public string Department { get; init; } = "";
    public string Location { get; init; } = "";
    public string WorkMode { get; init; } = "";
    public string EmploymentType { get; init; } = "Full-time";
    public JobStatus Status { get; init; }
    public int Openings { get; init; }
    public int MinExperience { get; init; }
    public int MaxExperience { get; init; }
    public List<string> RequiredSkills { get; init; } = [];
    public List<string> PreferredSkills { get; init; } = [];
    public string Education { get; init; } = "";
    public DateTime Deadline { get; init; }
    public DateTime CreatedOn { get; init; }
    public string HiringManager { get; init; } = "";
    public string Recruiter { get; init; } = "";
    public string Summary { get; init; } = "";
    public List<string> Responsibilities { get; init; } = [];
    public string Salary { get; init; } = "";
    public string Slug { get; init; } = "";
}

public class WorkEntry
{
    public string Role { get; init; } = "";
    public string Company { get; init; } = "";
    public string Period { get; init; } = "";
    public string Summary { get; init; } = "";
}

public class Candidate
{
    public int Id { get; init; }
    public string FullName { get; init; } = "";
    public string Email { get; init; } = "";
    public string Phone { get; init; } = "";
    public string Location { get; init; } = "";
    public string Headline { get; init; } = "";
    public double? ExperienceYears { get; init; }
    public List<string> Skills { get; init; } = [];
    public List<string> Education { get; init; } = [];
    public List<string> Certifications { get; init; } = [];
    public List<WorkEntry> WorkHistory { get; init; } = [];
    public List<string> Projects { get; init; } = [];
    public string? LinkedIn { get; init; }
    public string? Portfolio { get; init; }
    public string ResumeFileName { get; init; } = "";
    public int ResumeSizeKb { get; init; }
    public int? ParsingConfidence { get; init; }
    public List<string> DataWarnings { get; init; } = [];
    public string Initials => string.Concat(FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(2).Select(p => p[0]));
}

public class SkillMatch
{
    public string Skill { get; init; } = "";
    public SkillMatchType Type { get; init; }
    public string MatchedTerm { get; init; } = "";
    public double Similarity { get; init; }
    public string Evidence { get; init; } = "";
    public string Section { get; init; } = "";
}

public class ScoreComponent
{
    public string Name { get; init; } = "";
    public int Weight { get; init; }
    public double? Fraction { get; init; }   // null = could not be assessed
    public string Detail { get; init; } = "";
    public bool IsKnown => Fraction.HasValue;
}

public class ScreeningResult
{
    public int Score { get; init; }
    public List<SkillMatch> RequiredMatched { get; init; } = [];
    public List<string> RequiredMissing { get; init; } = [];
    public List<SkillMatch> PreferredMatched { get; init; } = [];
    public List<string> PreferredMissing { get; init; } = [];
    public List<ScoreComponent> Components { get; init; } = [];
    public List<string> Warnings { get; init; } = [];
    public string ModelVersion { get; init; } = "";
    public string ConfigVersion { get; init; } = "";
    public DateTime ScreenedOn { get; init; }
}

public class StatusEvent
{
    public DateTime On { get; init; }
    public string Title { get; init; } = "";
    public string By { get; init; } = "";
    public string? Reason { get; init; }
    public string Kind { get; init; } = "info";
}

public class RecruiterNote
{
    public DateTime On { get; init; }
    public string By { get; init; } = "";
    public string Text { get; init; } = "";
}

public class Application
{
    public int Id { get; init; }
    public int CandidateId { get; init; }
    public int JobId { get; init; }
    public DateTime AppliedOn { get; init; }
    public string Source { get; init; } = "Careers page";
    public ProcessingStatus Processing { get; init; }
    public string? ProcessingError { get; init; }
    public ApplicationStage Stage { get; init; }
    public string AssignedRecruiter { get; init; } = "";
    public string? StageReason { get; init; }
    public string TrackingCode { get; init; } = "";

    // Resolved by the store after seeding.
    public Candidate Candidate { get; set; } = null!;
    public Job Job { get; set; } = null!;
    public ScreeningResult? Screening { get; set; }
    public List<StatusEvent> History { get; set; } = [];
    public List<RecruiterNote> Notes { get; set; } = [];
}

public class InterviewFeedback
{
    public string By { get; init; } = "";
    public int TechnicalSkills { get; init; }
    public int ProblemSolving { get; init; }
    public int Communication { get; init; }
    public int RoleKnowledge { get; init; }
    public string Recommendation { get; init; } = "";
    public string Evidence { get; init; } = "";
    public DateTime SubmittedOn { get; init; }
    public double Average => (TechnicalSkills + ProblemSolving + Communication + RoleKnowledge) / 4.0;
}

public class Interview
{
    public int Id { get; init; }
    public int ApplicationId { get; init; }
    public int Round { get; init; }
    public string Title { get; init; } = "";
    public string Type { get; init; } = "";
    public DateTime StartsAt { get; init; }
    public int DurationMinutes { get; init; }
    public string TimeZone { get; init; } = "Asia/Kolkata (IST)";
    public string Location { get; init; } = "";
    public List<string> Interviewers { get; init; } = [];
    public InterviewStatus Status { get; init; }
    public InterviewFeedback? Feedback { get; init; }
    public Application Application { get; set; } = null!;
}

public class Offer
{
    public int Id { get; init; }
    public int ApplicationId { get; init; }
    public string Designation { get; init; } = "";
    public decimal AnnualCtcLakh { get; init; }
    public DateTime ProposedJoining { get; init; }
    public DateTime? SentOn { get; init; }
    public DateTime? RespondedOn { get; init; }
    public OfferStatus Status { get; init; }
    public string PreparedBy { get; init; } = "";
    public Application Application { get; set; } = null!;
}

public class Plan
{
    public string Name { get; init; } = "";
    public string Tagline { get; init; } = "";
    public decimal? MonthlyPrice { get; init; }
    public decimal? AnnualPrice { get; init; }
    public string ActiveJobs { get; init; } = "";
    public string ResumeCredits { get; init; } = "";
    public string Seats { get; init; } = "";
    public string Storage { get; init; } = "";
    public bool AdvancedAi { get; init; }
    public List<string> Features { get; init; } = [];
    public bool Highlight { get; init; }
    public int Subscribers { get; init; }
}

public class UsageMeter
{
    public string Name { get; init; } = "";
    public double Used { get; init; }
    public double Limit { get; init; }
    public string Unit { get; init; } = "";
    public string Icon { get; init; } = "";
    public int Percent => Limit <= 0 ? 0 : (int)Math.Round(Used / Limit * 100);
}

public class Subscription
{
    public string Plan { get; init; } = "";
    public string Cycle { get; init; } = "";
    public string Status { get; init; } = "";
    public DateTime PeriodStart { get; init; }
    public DateTime RenewsOn { get; init; }
    public string PaymentStatus { get; init; } = "";
    public List<UsageMeter> Usage { get; init; } = [];
}

public class Invoice
{
    public string Number { get; init; } = "";
    public DateTime IssuedOn { get; init; }
    public string Period { get; init; } = "";
    public decimal Amount { get; init; }
    public string Status { get; init; } = "";
}

public class AuditEvent
{
    public DateTime On { get; init; }
    public string Actor { get; init; } = "";
    public string Company { get; init; } = "";
    public string Action { get; init; } = "";
    public string Target { get; init; } = "";
    public string Ip { get; init; } = "";
    public string Severity { get; init; } = "Info";
}

public class ProcessingJob
{
    public string Id { get; init; } = "";
    public string Company { get; init; } = "";
    public string FileType { get; init; } = "";
    public ProcessingStatus Status { get; init; }
    public int Attempts { get; init; }
    public int DurationMs { get; init; }
    public DateTime QueuedOn { get; init; }
    public string? Error { get; init; }
}
