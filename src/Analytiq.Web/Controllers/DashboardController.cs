using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Models;
using Analytiq.Web.Models.Mock;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class DashboardController(MockDataStore data) : Controller
{
    public IActionResult Index()
    {
        var now = DateTime.Now;
        var apps = data.Applications;
        var (labels, weekly) = data.Weekly(apps.Select(a => a.AppliedOn));

        var vm = new DashboardViewModel
        {
            OpenJobs = data.Jobs.Count(j => j.Status == JobStatus.Published),
            Applications30d = apps.Count(a => a.AppliedOn >= data.Today.AddDays(-30)),
            AwaitingReview = apps.Count(MockDataStore.AwaitsReview),
            InterviewsNext7d = data.Interviews.Count(i => i.Status == InterviewStatus.Scheduled && i.StartsAt >= now && i.StartsAt <= now.AddDays(7)),
            OffersOutstanding = data.Offers.Count(o => o.Status is OfferStatus.Draft or OfferStatus.Sent),
            Hires90d = apps.Count(a => a.Stage == ApplicationStage.Hired && data.HiredOn(a) >= data.Today.AddDays(-90)),
            Funnel = MockDataStore.Funnel(apps.Where(a => a.AppliedOn >= data.Today.AddDays(-30))),
            WeekLabels = labels,
            WeeklyApplications = weekly,
            NeedsAttention = apps.Where(a => MockDataStore.AwaitsReview(a) || a.Stage == ApplicationStage.InfoRequested)
                                 .OrderByDescending(a => a.AppliedOn).Take(5).ToList(),
            RecentApplications = apps.OrderByDescending(a => a.AppliedOn).Take(6).ToList(),
            UpcomingInterviews = data.Interviews.Where(i => i.Status == InterviewStatus.Scheduled && i.StartsAt >= now.AddHours(-1))
                                     .OrderBy(i => i.StartsAt).Take(5).ToList(),
            JobPipelines = data.Jobs.Where(j => j.Status == JobStatus.Published).Select(j =>
            {
                var ja = data.ApplicationsFor(j.Id).ToList();
                return (j, ja.Count, ja.Count(a => a.Screening is not null),
                        ja.Count(a => MockDataStore.Reached(a, ApplicationStage.Shortlisted)),
                        ja.Count(a => MockDataStore.Reached(a, ApplicationStage.Interview)));
            }).ToList(),
            Processing = Enum.GetValues<ProcessingStatus>().ToDictionary(s => s, s => apps.Count(a => a.Processing == s)),
        };
        return View(vm);
    }
}
