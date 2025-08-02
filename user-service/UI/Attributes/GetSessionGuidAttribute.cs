using Application.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace UI.Attributes;

public class GetSessionGuidAttribute: ActionFilterAttribute
{
    public const string SessionGuidKey = "SessionGuid";
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var logger = context.HttpContext.RequestServices.GetService(typeof(ILogger)) as ILogger;
        var sessionId = context.HttpContext.User.FindFirst(JwtCustomClaimNames.Session)?.Value;
        if (string.IsNullOrEmpty(sessionId))
        {
            logger?.LogError("Session ID not found in user claims.");
            context.Result = new UnauthorizedResult();
            return;
        }
        var sessionGuid = GuidParser.SafeParse(sessionId);
        if (sessionGuid is null)
        {
            logger?.LogError("Invalid session ID format: {SessionId}", sessionId);
            context.Result = new BadRequestObjectResult("Invalid user ID format.");
            return;
        }
        context.HttpContext.Items[SessionGuidKey] = sessionGuid.Value;
        base.OnActionExecuting(context);
    }
}