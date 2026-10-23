using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class BillingController(MockDataStore data) : Controller
{
    public IActionResult Index() => View(data);

    public IActionResult Plans() => View(data);

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult ChangePlan(string plan, string cycle)
    {
        TempData["Toast"] = $"Demo billing mode: plan change to {plan} ({cycle}) recorded as pending. No payment was taken; a real gateway would confirm via verified webhook.";
        TempData["ToastVariant"] = "info";
        return RedirectToAction(nameof(Index));
    }
}
