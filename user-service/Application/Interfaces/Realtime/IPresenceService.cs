using Application.Common;
using Application.DTOs.Presence;

namespace Application.Interfaces.Realtime;

/// <summary>
/// Service for tracking user presence (online/offline status)
/// </summary>
public interface IPresenceService
{
    /// <summary>
    /// Mark user as online and return their connection info
    /// </summary>
    Task<Result<UserPresenceInfo>> UserConnectedAsync(Guid userId, string connectionId);
    
    /// <summary>
    /// Mark user as offline (if no more connections)
    /// Returns true if user went fully offline, false if they still have other connections
    /// </summary>
    Task<Result<bool>> UserDisconnectedAsync(string connectionId);
    
    /// <summary>
    /// Get all currently online users
    /// </summary>
    Task<Result<List<UserPresenceInfo>>> GetOnlineUsersAsync();
    
    /// <summary>
    /// Get online friends of a specific user
    /// </summary>
    Task<Result<List<UserPresenceInfo>>> GetOnlineFriendsAsync(Guid userId);
    
    /// <summary>
    /// Check if specific user is online
    /// </summary>
    Task<Result<bool>> IsUserOnlineAsync(Guid userId);
    
    /// <summary>
    /// Check multiple users' online status at once
    /// </summary>
    Task<Result<IDictionary<Guid,bool>>> AreUsersOnlineAsync(IEnumerable<Guid> userIds);

    /// <summary>
    /// Get user info by connection ID
    /// </summary>
    Task<Result<UserPresenceInfo>> GetUserByConnectionIdAsync(string connectionId);
}
