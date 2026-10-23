using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Models;
using Analytiq.Web.Models.Mock;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class AnalyticsController(MockDataStore data) : Controller
{
    public IActionResult Index(string? department, int days = 90)
    {
        var from = data.Today.AddDays(-days);
        var apps = data.Applications.Where(a => a.AppliedOn >= from && (department is null || a.Job.Department == department)).ToList();
        var jobs = data.Jobs.Where(j => department is null || j.Department == department).ToList();
        var departments = data.Departments.Select(d => d.Name).Where(d => data.Jobs.Any(j => j.Department == d)).ToList();
        var sources = apps.GroupBy(a => a.Source).OrderByDescending(g => g.Count()).ToList();
        var (weeks, processed) = data.Weekly(apps.Where(a => a.Screening is not null).Select(a => a.AppliedOn));
        var (_, failed) = data.Weekly(apps.Where(a => a.Processing == ProcessingStatus.Failed).Select(a => a.AppliedOn));

        ViewBag.Department = department;
        ViewBag.Days = days;
        ViewBag.Departments = departments;

        return View(new AnalyticsViewModel
        {
            TotalApplications = apps.Count,
            Screened = apps.Count(a => a.Screening is not null),
            ScreeningCompletionRate = apps.Count == 0 ? 0 : apps.Count(a => a.Screening is not null) * 100.0 / apps.Count,
            AwaitingReview = apps.Count(MockDataStore.AwaitsReview),
            InterviewsScheduled = data.Interviews.Count(i => apps.Contains(i.Application) && i.Status != InterviewStatus.Cancelled),
            OffersMade = data.Offers.Count(o => apps.Contains(o.Application) && o.Status != OfferStatus.Draft),
            Hires = apps.Count(a => a.Stage == ApplicationStage.Hired),
            TimeToHireSamples = apps.Where(a => a.Stage == ApplicationStage.Hired)
                                    .Select(a => (int)Math.Round((data.HiredOn(a)!.Value - a.AppliedOn).TotalDays)).ToList(),
            Funnel = MockDataStore.Funnel(apps),
            JobLabels = jobs.Select(j => j.Title).ToList(),
            ApplicationsPerJob = jobs.Select(j => apps.Count(a => a.JobId == j.Id)).ToList(),
            DepartmentLabels = departments,
            DepartmentActivity =
            [
                new("Applications", departments.Select(d => apps.Count(a => a.Job.Department == d)).ToList()),
                new("Interviews", departments.Select(d => apps.Count(a => a.Job.Department == d && MockDataStore.Reached(a, ApplicationStage.Interview))).ToList()),
                new("Offers", departments.Select(d => apps.Count(a => a.Job.Department == d && MockDataStore.Reached(a, ApplicationStage.Offer))).ToList()),
            ],
            SourceLabels = sources.Select(g => g.Key).ToList(),
            SourceCounts = sources.Select(g => g.Count()).ToList(),
            Processing = Enum.GetValues<ProcessingStatus>().ToDictionary(s => s, s => apps.Count(a => a.Processing == s)),
            WeekLabels = weeks,
            WeeklyProcessed = processed,
            WeeklyFailed = failed,
            CreditsUsed = (int)data.Subscription.Usage[1].Used,
            CreditsLimit = (int)data.Subscription.Usage[1].Limit,
            JobTable = jobs.Select(j =>
            {
                var ja = apps.Where(a => a.JobId == j.Id).ToList();
                var scored = ja.Where(a => a.Screening is not null).ToList();
                return (j, ja.Count, scored.Count == 0 ? (double?)null : scored.Average(a => a.Screening!.Score),
                        ja.Count(a => MockDataStore.Reached(a, ApplicationStage.Shortlisted)),
                        ja.Count(a => MockDataStore.Reached(a, ApplicationStage.Interview)));
            }).ToList(),
        });
    }
}
