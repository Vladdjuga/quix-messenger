using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Application.Utilities;
using Grpc.Core;

namespace UI.Utilities;

public static class ContextExtensions
{
    public static Guid? GetAuthenticatedUserId(this ServerCallContext context)
    {
        var httpContext = context.GetHttpContext();
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
            return null;

        var userIdClaim = httpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return null;

        return GuidParser.SafeParse(userIdClaim);
    }

    public static string? GetBearerToken(this ServerCallContext context)
    {
        var httpContext = context.GetHttpContext();
        if (httpContext?.Request?.Headers == null)
            return null;

        var authHeader = httpContext.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return null;

        return authHeader.Substring("Bearer ".Length).Trim();
    }
}
