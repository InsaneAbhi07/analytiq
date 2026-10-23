using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Models.Mock;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class OffersController(MockDataStore data) : Controller
{
    public IActionResult Index()
    {
        ViewBag.Eligible = data.Applications.Where(a => a.Stage == ApplicationStage.Interview && data.OfferFor(a.Id) is null).ToList();
        return View(data.Offers.OrderByDescending(o => o.SentOn ?? data.Today).ToList());
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Create(int applicationId)
    {
        var app = data.GetApplication(applicationId);
        TempData["Toast"] = $"Offer draft created for {app?.Candidate.FullName} (prototype — not saved).";
        return RedirectToAction(nameof(Index));
    }
}
