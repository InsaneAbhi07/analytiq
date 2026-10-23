using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Models.Mock;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

/// <summary>Public careers portal for one company (tenant resolved from the URL slug in the real build).</summary>
public class CareersController(MockDataStore data) : Controller
{
    public IActionResult Index(string? q, string? location, string? type)
    {
        var jobs = data.Jobs.Where(j => j.Status == JobStatus.Published);
        if (!string.IsNullOrWhiteSpace(q))
            jobs = jobs.Where(j => j.Title.Contains(q, StringComparison.OrdinalIgnoreCase)
                                   || j.RequiredSkills.Any(s => s.Contains(q, StringComparison.OrdinalIgnoreCase))
                                   || j.Department.Contains(q, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(location)) jobs = jobs.Where(j => j.Location == location || j.WorkMode == location);
        if (!string.IsNullOrWhiteSpace(type)) jobs = jobs.Where(j => j.EmploymentType == type);

        ViewBag.Q = q; ViewBag.Location = location; ViewBag.Type = type;
        ViewBag.Locations = data.Jobs.Where(j => j.Status == JobStatus.Published).Select(j => j.Location).Distinct().ToList();
        return View(jobs.ToList());
    }

    public IActionResult Job(int id)
    {
        var job = data.GetJob(id);
        return job is null || job.Status != JobStatus.Published ? NotFound() : View(job);
    }

    public IActionResult Apply(int id)
    {
        var job = data.GetJob(id);
        return job is null || job.Status != JobStatus.Published ? NotFound() : View(job);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Apply(int id, string fullName, IFormFile? resume)
    {
        // Prototype: the file is not stored. The real build validates magic bytes, size and type,
        // stores it privately and queues a background processing job.
        var code = "ZF-" + Guid.NewGuid().ToString("N")[..5].ToUpperInvariant();
        return RedirectToAction(nameof(Confirmation), new { id, code, name = fullName });
    }

    public IActionResult Confirmation(int id, string code, string? name)
    {
        ViewBag.Code = code;
        ViewBag.Name = name;
        return View(data.GetJob(id));
    }

    public IActionResult Status(string? code)
    {
        ViewBag.Code = code;
        ViewBag.Searched = code is not null;
        return View(code is null ? null : data.FindByTrackingCode(code));
    }

    public IActionResult Privacy() => View();
}
