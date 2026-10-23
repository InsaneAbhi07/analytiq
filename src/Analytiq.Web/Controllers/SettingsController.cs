using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class SettingsController(MockDataStore data) : Controller
{
    public IActionResult Index(string tab = "company")
    {
        ViewBag.Tab = tab;
        return View(data);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Save(string tab)
    {
        TempData["Toast"] = "Settings saved (prototype — not persisted).";
        return RedirectToAction(nameof(Index), new { tab });
    }
}
