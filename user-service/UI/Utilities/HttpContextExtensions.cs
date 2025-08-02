using Microsoft.AspNetCore.Http;
using UI.Attributes;

namespace UI.Utilities;

public static class HttpContextExtensions
{
    public static Guid GetUserGuid(this HttpContext httpContext)
    {
        if (httpContext.Items.TryGetValue(GetUserGuidAttribute.UserGuidKey, out var value)
            && value is Guid userGuid)
            return userGuid;
        throw new InvalidOperationException("User GUID not found in HttpContext.");
    }

    public static Guid GetSessionGuid(this HttpContext httpContext)
    {
        if (httpContext.Items.TryGetValue(GetSessionGuidAttribute.SessionGuidKey, out var value) 
            && value is Guid sessionGuid)
            return sessionGuid;
        throw new InvalidOperationException("Session GUID not found in HttpContext.");
    }
}