using Microsoft.AspNetCore.Mvc;

namespace Analytiq.Web.Controllers;

// Prototype only: no authentication happens here. The real build uses ASP.NET Core Identity.
public class AccountController : Controller
{
    public IActionResult Login() => View();

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Login(string email, string role)
    {
        TempData["Toast"] = "Signed in (prototype — no real authentication).";
        return role switch
        {
            "admin" => RedirectToAction("Index", "Admin"),
            "interviewer" => RedirectToAction("Mine", "Interviews"),
            _ => RedirectToAction("Index", "Dashboard"),
        };
    }

    public IActionResult Register() => View();

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Register(string companyName)
    {
        TempData["Toast"] = $"Workspace for “{companyName}” created. A verification email would be sent (prototype).";
        return RedirectToAction(nameof(Onboarding));
    }

    public IActionResult Onboarding() => View();

    public IActionResult ForgotPassword() => View();
}
