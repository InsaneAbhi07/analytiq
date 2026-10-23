using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

/// <summary>Platform Super Admin console. Aggregate, tenant-level data only — no candidate resume content.</summary>
public class AdminController(MockDataStore data) : Controller
{
    public override void OnActionExecuting(Microsoft.AspNetCore.Mvc.Filters.ActionExecutingContext context)
    {
        ViewData["Shell"] = "admin";
        base.OnActionExecuting(context);
    }

    public IActionResult Index() => View(data);

    public IActionResult Companies() => View(data.PlatformCompanies);

    public IActionResult Plans() => View(data.Plans);

    public IActionResult Processing() => View(data.ProcessingJobs);

    public IActionResult Audit() => View(data.AuditLog);

    public IActionResult System() => View();

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Save(string returnTo)
    {
        TempData["Toast"] = "Saved and written to the audit log (prototype — not persisted).";
        return RedirectToAction(returnTo is "Plans" or "System" ? returnTo : nameof(Index));
    }
}
