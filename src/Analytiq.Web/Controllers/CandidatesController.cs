using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Models;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class CandidatesController(MockDataStore data) : Controller
{
    public IActionResult Index(int? jobId)
    {
        ViewBag.JobId = jobId;
        return View(data.Applications.OrderByDescending(a => a.Screening?.Score ?? -1).ThenByDescending(a => a.AppliedOn).ToList());
    }

    // id = application id. A candidate can have several applications; each is screened against its own job.
    public IActionResult Details(int id)
    {
        var app = data.GetApplication(id);
        if (app is null) return NotFound();
        return View(new CandidateProfileViewModel
        {
            Application = app,
            OtherApplications = data.ApplicationsOf(app.CandidateId).Where(a => a.Id != id).ToList(),
            Interviews = data.InterviewsFor(id).ToList(),
            Offer = data.OfferFor(id),
        });
    }

    public IActionResult Compare(string? ids)
    {
        var selected = (ids ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => int.TryParse(s, out var v) ? data.GetApplication(v) : null)
            .Where(a => a is not null).Select(a => a!).Take(4).ToList();
        if (selected.Count < 2)
            selected = data.ApplicationsFor(1).Where(a => a.Screening is not null).OrderByDescending(a => a.Screening!.Score).Take(3).ToList();
        return View(selected);
    }

    public IActionResult Resume(int id)
    {
        TempData["Toast"] = "In the real build this streams the file through an authorised, audited endpoint — never a public URL.";
        TempData["ToastVariant"] = "info";
        return RedirectToAction(nameof(Details), new { id });
    }
}
