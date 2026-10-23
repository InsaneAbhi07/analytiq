using Analytiq.Web.Models.Mock;

namespace Analytiq.Web.Models;

public record FunnelStep(string Label, int Count);

public record ChartSeries(string Label, IReadOnlyList<int> Values);

public class DashboardViewModel
{
    public int OpenJobs { get; init; }
    public int Applications30d { get; init; }
    public int AwaitingReview { get; init; }
    public int InterviewsNext7d { get; init; }
    public int OffersOutstanding { get; init; }
    public int Hires90d { get; init; }
    public List<FunnelStep> Funnel { get; init; } = [];
    public List<string> WeekLabels { get; init; } = [];
    public List<int> WeeklyApplications { get; init; } = [];
    public List<Application> NeedsAttention { get; init; } = [];
    public List<Application> RecentApplications { get; init; } = [];
    public List<Interview> UpcomingInterviews { get; init; } = [];
    public List<(Job Job, int Total, int Screened, int Shortlisted, int Interview)> JobPipelines { get; init; } = [];
    public Dictionary<ProcessingStatus, int> Processing { get; init; } = [];
}

public class AnalyticsViewModel
{
    public int TotalApplications { get; init; }
    public int Screened { get; init; }
    public double ScreeningCompletionRate { get; init; }
    public int AwaitingReview { get; init; }
    public int InterviewsScheduled { get; init; }
    public int OffersMade { get; init; }
    public int Hires { get; init; }
    public List<int> TimeToHireSamples { get; init; } = [];
    public List<FunnelStep> Funnel { get; init; } = [];
    public List<string> JobLabels { get; init; } = [];
    public List<int> ApplicationsPerJob { get; init; } = [];
    public List<string> DepartmentLabels { get; init; } = [];
    public List<ChartSeries> DepartmentActivity { get; init; } = [];
    public List<string> SourceLabels { get; init; } = [];
    public List<int> SourceCounts { get; init; } = [];
    public Dictionary<ProcessingStatus, int> Processing { get; init; } = [];
    public List<string> WeekLabels { get; init; } = [];
    public List<int> WeeklyProcessed { get; init; } = [];
    public List<int> WeeklyFailed { get; init; } = [];
    public int CreditsUsed { get; init; }
    public int CreditsLimit { get; init; }
    public List<(Job Job, int Applicants, double? AvgScore, int Shortlisted, int Interviews)> JobTable { get; init; } = [];
}

public class JobFormModel
{
    public int? Id { get; set; }
    public string Title { get; set; } = "";
    public string Department { get; set; } = "";
    public string Location { get; set; } = "";
    public string WorkMode { get; set; } = "Hybrid";
    public string EmploymentType { get; set; } = "Full-time";
    public int Openings { get; set; } = 1;
    public int MinExperience { get; set; }
    public int MaxExperience { get; set; }
    public string RequiredSkills { get; set; } = "";
    public string PreferredSkills { get; set; } = "";
    public string Education { get; set; } = "";
    public string Description { get; set; } = "";
    public string Responsibilities { get; set; } = "";
    public string Salary { get; set; } = "";
    public DateTime Deadline { get; set; } = DateTime.Today.AddDays(30);
    public string Recruiter { get; set; } = "";
    public string Status { get; set; } = "Draft";
}

public class CandidateProfileViewModel
{
    public Application Application { get; init; } = null!;
    public List<Application> OtherApplications { get; init; } = [];
    public List<Interview> Interviews { get; init; } = [];
    public Offer? Offer { get; init; }
}
