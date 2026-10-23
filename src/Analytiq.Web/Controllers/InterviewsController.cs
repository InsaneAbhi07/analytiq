using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Models.Mock;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class InterviewsController(MockDataStore data) : Controller
{
    public IActionResult Index() => View(data.Interviews.OrderBy(i => i.StartsAt).ToList());

    /// <summary>Interviewer view: only interviews assigned to the signed-in interviewer.</summary>
    public IActionResult Mine()
    {
        const string interviewer = "Ananya Iyer";
        ViewBag.Interviewer = interviewer;
        return View(data.Interviews.Where(i => i.Interviewers.Contains(interviewer)).OrderBy(i => i.StartsAt).ToList());
    }

    public IActionResult Schedule(int? applicationId)
    {
        ViewBag.Selected = applicationId;
        return View(data.Applications.Where(a => a.Stage is ApplicationStage.Shortlisted or ApplicationStage.Interview).ToList());
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Schedule(int applicationId, DateTime date)
    {
        var app = data.GetApplication(applicationId);
        TempData["Toast"] = $"Interview scheduled with {app?.Candidate.FullName} on {date:dd MMM yyyy}. Invites go out once email is configured (prototype).";
        return RedirectToAction(nameof(Index));
    }

    public IActionResult Feedback(int id)
    {
        var interview = data.Interviews.FirstOrDefault(i => i.Id == id);
        return interview is null ? NotFound() : View(interview);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Feedback(int id, string recommendation)
    {
        TempData["Toast"] = "Feedback submitted. It is locked after submission and visible to the hiring team (prototype).";
        return RedirectToAction(nameof(Mine));
    }
}
