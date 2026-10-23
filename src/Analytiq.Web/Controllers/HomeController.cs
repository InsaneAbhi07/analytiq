using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Analytiq.Web.Models;
using Analytiq.Web.Services;

namespace Analytiq.Web.Controllers;

public class HomeController(MockDataStore data) : Controller
{
    public IActionResult Index() => View(data.Plans);

    [Route("/Home/NotFound")]
    public new IActionResult NotFound() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error() => View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
}
