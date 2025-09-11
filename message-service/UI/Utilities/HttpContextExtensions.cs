using System.IdentityModel.Tokens.Jwt;
using Application.Utilities;

namespace UI.Utilities;

public static class HttpContextExtensions
{
    private static Guid? GetAuthenticatedUserId(this HttpContext httpContext)
    {
        if (httpContext?.User?.Identity?.IsAuthenticated != true)
            return null;

        var userIdClaim = httpContext.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return string.IsNullOrEmpty(userIdClaim) ? null : GuidParser.SafeParse(userIdClaim);
    }

    private static string? GetBearerToken(this HttpContext httpContext)
    {
        if (httpContext?.Request?.Headers == null)
            return null;

        var authHeader = httpContext.Request.Headers.Authorization.FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return null;

        return authHeader["Bearer ".Length..].Trim();
    }

    public static string GetBearerTokenOrThrow(this HttpContext httpContext)
    {
        var token = httpContext.GetBearerToken();
        if (string.IsNullOrEmpty(token))
            throw new UnauthorizedAccessException("Bearer token not found in request");
        
        return token;
    }

    public static Guid GetAuthenticatedUserIdOrThrow(this HttpContext httpContext)
    {
        var userId = httpContext.GetAuthenticatedUserId();
        if (userId == null)
            throw new UnauthorizedAccessException("Authenticated user ID not found");
        
        return userId.Value;
    }
}
