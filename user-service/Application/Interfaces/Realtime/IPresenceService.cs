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
    Task<UserPresenceInfo> UserConnectedAsync(Guid userId, string connectionId);
    
    /// <summary>
    /// Mark user as offline (if no more connections)
    /// </summary>
    Task<bool> UserDisconnectedAsync(string connectionId);
    
    /// <summary>
    /// Get all currently online users
    /// </summary>
    Task<List<UserPresenceInfo>> GetOnlineUsersAsync();
    
    /// <summary>
    /// Get online friends of a specific user
    /// </summary>
    Task<List<UserPresenceInfo>> GetOnlineFriendsAsync(Guid userId);
    
    /// <summary>
    /// Check if specific user is online
    /// </summary>
    Task<bool> IsUserOnlineAsync(Guid userId);
    Task<IDictionary<Guid,bool>> AreUsersOnlineAsync(IEnumerable<Guid> userIds);

    /// <summary>
    /// Get user info by connection ID
    /// </summary>
    Task<UserPresenceInfo?> GetUserByConnectionIdAsync(string connectionId);
}
