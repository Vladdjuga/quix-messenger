using Microsoft.AspNetCore.Http;
using UI.Attributes;

namespace UI.Utilities;

public static class HttpContextExtensions
{
    extension(HttpContext httpContext)
    {
        public Guid GetUserGuid()
        {
            if (httpContext.Items.TryGetValue(GetUserGuidAttribute.UserGuidKey, out var value)
                && value is Guid userGuid)
                return userGuid;
            throw new InvalidOperationException("User GUID not found in HttpContext.");
        }

        public Guid GetSessionGuid()
        {
            if (httpContext.Items.TryGetValue(GetSessionGuidAttribute.SessionGuidKey, out var value) 
                && value is Guid sessionGuid)
                return sessionGuid;
            throw new InvalidOperationException("Session GUID not found in HttpContext.");
        }
    }
}