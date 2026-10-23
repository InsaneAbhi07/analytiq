using Analytiq.Web.Models.Mock;

namespace Analytiq.Web.Services;

/// <summary>Display labels and CSS badge classes shared by the views.</summary>
public static class Ui
{
    public static string StageLabel(ApplicationStage s) => s switch
    {
        ApplicationStage.New => "New",
        ApplicationStage.Screening => "In screening",
        ApplicationStage.Shortlisted => "Shortlisted",
        ApplicationStage.OnHold => "On hold",
        ApplicationStage.InfoRequested => "Info requested",
        ApplicationStage.Interview => "Interview",
        ApplicationStage.Offer => "Offer",
        ApplicationStage.Hired => "Hired",
        ApplicationStage.Rejected => "Rejected",
        ApplicationStage.Withdrawn => "Withdrawn",
        _ => s.ToString()
    };

    public static string StageBadge(ApplicationStage s) => s switch
    {
        ApplicationStage.New => "nx-badge-neutral",
        ApplicationStage.Screening => "nx-badge-info",
        ApplicationStage.Shortlisted => "nx-badge-primary",
        ApplicationStage.OnHold or ApplicationStage.InfoRequested => "nx-badge-warning",
        ApplicationStage.Interview => "nx-badge-violet",
        ApplicationStage.Offer => "nx-badge-teal",
        ApplicationStage.Hired => "nx-badge-success",
        ApplicationStage.Rejected => "nx-badge-danger",
        _ => "nx-badge-neutral"
    };

    /// <summary>Candidate-facing wording: no internal notes, no scores.</summary>
    public static string CandidateStatus(ApplicationStage s) => s switch
    {
        ApplicationStage.New or ApplicationStage.Screening => "Under review",
        ApplicationStage.Shortlisted or ApplicationStage.OnHold => "Under review",
        ApplicationStage.InfoRequested => "Action needed — more information requested",
        ApplicationStage.Interview => "Interview stage",
        ApplicationStage.Offer => "Offer stage",
        ApplicationStage.Hired => "Hired",
        ApplicationStage.Rejected => "Not progressing",
        ApplicationStage.Withdrawn => "Withdrawn",
        _ => "Under review"
    };

    public static string ProcessingLabel(ProcessingStatus p) => p switch
    {
        ProcessingStatus.NeedsReview => "Needs review",
        _ => p.ToString()
    };

    public static string ProcessingBadge(ProcessingStatus p) => p switch
    {
        ProcessingStatus.Completed => "nx-badge-success",
        ProcessingStatus.NeedsReview => "nx-badge-warning",
        ProcessingStatus.Failed => "nx-badge-danger",
        ProcessingStatus.Processing => "nx-badge-info",
        _ => "nx-badge-neutral"
    };

    public static string ProcessingIcon(ProcessingStatus p) => p switch
    {
        ProcessingStatus.Completed => "bi-check-circle",
        ProcessingStatus.NeedsReview => "bi-exclamation-triangle",
        ProcessingStatus.Failed => "bi-x-octagon",
        ProcessingStatus.Processing => "bi-arrow-repeat nx-spin",
        _ => "bi-hourglass-split"
    };

    public static string JobBadge(JobStatus s) => s switch
    {
        JobStatus.Published => "nx-badge-success",
        JobStatus.Draft => "nx-badge-neutral",
        JobStatus.Paused => "nx-badge-warning",
        JobStatus.Closed => "nx-badge-danger",
        _ => "nx-badge-neutral"
    };

    public static string InterviewBadge(InterviewStatus s) => s switch
    {
        InterviewStatus.Scheduled => "nx-badge-info",
        InterviewStatus.Completed => "nx-badge-success",
        InterviewStatus.NoShow => "nx-badge-warning",
        InterviewStatus.Cancelled => "nx-badge-danger",
        _ => "nx-badge-neutral"
    };

    public static string InterviewLabel(InterviewStatus s) => s == InterviewStatus.NoShow ? "No-show" : s.ToString();

    public static string OfferBadge(OfferStatus s) => s switch
    {
        OfferStatus.Draft => "nx-badge-neutral",
        OfferStatus.Sent => "nx-badge-info",
        OfferStatus.Accepted => "nx-badge-teal",
        OfferStatus.Joined => "nx-badge-success",
        OfferStatus.Declined => "nx-badge-danger",
        _ => "nx-badge-neutral"
    };

    public static string CompanyBadge(string status) => status switch
    {
        "Active" => "nx-badge-success",
        "Trial" => "nx-badge-info",
        "Suspended" => "nx-badge-warning",
        "Deactivated" => "nx-badge-danger",
        "Invited" => "nx-badge-neutral",
        _ => "nx-badge-neutral"
    };

    public static string SeverityBadge(string severity) => severity switch
    {
        "High" => "nx-badge-danger",
        "Warning" => "nx-badge-warning",
        _ => "nx-badge-neutral"
    };

    /// <summary>Score band. Low scores use neutral grey on purpose: a low match is missing evidence, not a verdict.</summary>
    public static string ScoreBand(int score) => score >= 75 ? "high" : score >= 50 ? "mid" : "low";

    public static string Ago(DateTime when)
    {
        var span = DateTime.Now - when;
        if (span.TotalMinutes < 1) return "just now";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} min ago";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} h ago";
        if (span.TotalDays < 30) return $"{(int)span.TotalDays} d ago";
        return when.ToString("dd MMM yyyy");
    }

    public static string Lakh(decimal v) => $"₹{v:0.##} LPA";

    public static string Inr(decimal v) => string.Format(new System.Globalization.CultureInfo("en-IN"), "₹{0:N2}", v);
}
