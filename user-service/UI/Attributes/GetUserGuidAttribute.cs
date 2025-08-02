using System.IdentityModel.Tokens.Jwt;
using Application.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace UI.Attributes;

public class GetUserGuidAttribute: ActionFilterAttribute
{
    public const string UserGuidKey = "UserGuid";
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var logger = context.HttpContext.RequestServices.GetService(typeof(ILogger)) as ILogger;
        var userId = context.HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            logger?.LogError("User ID not found in claims.");
            context.Result = new UnauthorizedResult();
            return;
        }
        var userGuid = GuidParser.SafeParse(userId);
        if (userGuid is null)
        {
            logger?.LogError("Invalid user ID format: {UserId}", userId);
            context.Result = new BadRequestObjectResult("Invalid user ID format.");
            return;
        }
        context.HttpContext.Items[UserGuidKey] = userGuid.Value;
        base.OnActionExecuting(context);
    }
}