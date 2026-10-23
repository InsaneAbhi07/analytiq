using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Models;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class JobsController(MockDataStore data) : Controller
{
    public IActionResult Index() => View(data.Jobs.OrderBy(j => j.Status).ThenByDescending(j => j.CreatedOn).ToList());

    public IActionResult Details(int id)
    {
        var job = data.GetJob(id);
        return job is null ? NotFound() : View(job);
    }

    public IActionResult Create() => View("Form", new JobFormModel { Recruiter = data.CurrentUser.Name });

    public IActionResult Edit(int id)
    {
        var j = data.GetJob(id);
        if (j is null) return NotFound();
        return View("Form", new JobFormModel
        {
            Id = j.Id, Title = j.Title, Department = j.Department, Location = j.Location, WorkMode = j.WorkMode,
            EmploymentType = j.EmploymentType, Openings = j.Openings, MinExperience = j.MinExperience, MaxExperience = j.MaxExperience,
            RequiredSkills = string.Join(",", j.RequiredSkills), PreferredSkills = string.Join(",", j.PreferredSkills),
            Education = j.Education, Description = j.Summary, Responsibilities = string.Join("\n", j.Responsibilities),
            Salary = j.Salary, Deadline = j.Deadline, Recruiter = j.Recruiter, Status = j.Status.ToString()
        });
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Save(JobFormModel model, string intent)
    {
        TempData["Toast"] = intent == "publish"
            ? $"“{model.Title}” published to your careers page (prototype — not saved)."
            : $"“{model.Title}” saved as draft (prototype — not saved).";
        return model.Id is { } id ? RedirectToAction(nameof(Details), new { id }) : RedirectToAction(nameof(Index));
    }
}
