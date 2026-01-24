using System.IdentityModel.Tokens.Jwt;
using Application.Utilities;
using Microsoft.AspNetCore.SignalR;

namespace UI.Utilities;

public static class HubCallerContextExtensions
{
    extension(HubCallerContext context)
    {
        public Guid GetUserGuid()
        {
            var userId = context.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userId))
                throw new InvalidOperationException("User ID not found in claims.");
            
            var userGuid = GuidParser.SafeParse(userId);
            return userGuid ?? throw new InvalidOperationException($"Invalid user ID format: {userId}");
        }

        public Guid GetSessionGuid()
        {
            var sessionId = context.User?.FindFirst(JwtCustomClaimNames.Session)?.Value;
            if (string.IsNullOrEmpty(sessionId))
                throw new InvalidOperationException("Session ID not found in claims.");
            
            var sessionGuid = GuidParser.SafeParse(sessionId);
            if (sessionGuid is null || sessionGuid == Guid.Empty)
                throw new InvalidOperationException($"Invalid session ID format: {sessionId}");
            
            return sessionGuid.Value;
        }

        public string GetUsername()
        {
            var username = context.User?.FindFirst(JwtRegisteredClaimNames.UniqueName)?.Value;
            if (string.IsNullOrEmpty(username))
                throw new InvalidOperationException("Username not found in claims.");
            
            return username;
        }
    }
}
