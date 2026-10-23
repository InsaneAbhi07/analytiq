using System.Net;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace Analytiq.Web.Services;

public static class HtmlExtensions
{
    /// <summary>Circular match-score indicator. A null score renders as "—" (not yet screened).</summary>
    public static IHtmlContent Score(this IHtmlHelper _, int? score, string size = "")
    {
        if (score is null)
            return new HtmlString($"<span class=\"nx-score nx-score-none {size}\" title=\"Not screened yet\"><span>—</span></span>");

        var band = Ui.ScoreBand(score.Value);
        return new HtmlString(
            $"<span class=\"nx-score {size}\" data-band=\"{band}\" style=\"--p:{score}\" title=\"Match score {score}/100\" role=\"img\" aria-label=\"Match score {score} out of 100\"><span>{score}</span></span>");
    }

    public static IHtmlContent Avatar(this IHtmlHelper _, string initials, string size = "")
        => new HtmlString($"<span class=\"nx-avatar {size}\" aria-hidden=\"true\">{WebUtility.HtmlEncode(initials)}</span>");
}
