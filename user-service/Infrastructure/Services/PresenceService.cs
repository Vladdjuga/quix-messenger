using Application.DTOs.Presence;
using Application.Interfaces.Realtime;
using System.Collections.Concurrent;

namespace Infrastructure.Services;

/// <summary>
/// In-memory implementation of presence tracking.
/// For multi-instance deployments, consider using Redis or database.
/// </summary>
public class PresenceService : IPresenceService
{
    // connectionId -> UserPresenceInfo
    private readonly ConcurrentDictionary<string, UserPresenceInfo> _connections = new();
    
    // userId -> UserPresenceInfo (for quick lookup)
    private readonly ConcurrentDictionary<Guid, UserPresenceInfo> _users = new();

    public Task<UserPresenceInfo> UserConnectedAsync(Guid userId, string connectionId)
    {
        var existingUser = _users.GetOrAdd(userId, _ => new UserPresenceInfo
        {
            UserId = userId,
            ConnectedAt = DateTime.UtcNow,
            ConnectionIds = []
        });

        // Add new connection
        lock (existingUser.ConnectionIds)
        {
            if (!existingUser.ConnectionIds.Contains(connectionId))
                existingUser.ConnectionIds.Add(connectionId);
        }

        // Map connectionId -> user
        _connections[connectionId] = existingUser;

        return Task.FromResult(existingUser);
    }

    public Task<bool> UserDisconnectedAsync(string connectionId)
    {
        if (!_connections.TryRemove(connectionId, out var userInfo))
            return Task.FromResult(false);

        // Remove connection from user's list
        lock (userInfo.ConnectionIds)
        {
            userInfo.ConnectionIds.Remove(connectionId);
            
            // If no more connections, remove user completely
            if (userInfo.ConnectionIds.Count != 0) return Task.FromResult(false); // User still has other connections
            _users.TryRemove(userInfo.UserId, out _);
            return Task.FromResult(true); // User went offline
        }
    }

    public Task<List<UserPresenceInfo>> GetOnlineUsersAsync()
    {
        return Task.FromResult(_users.Values.ToList());
    }

    public async Task<List<UserPresenceInfo>> GetOnlineFriendsAsync(Guid userId)
    {
        // TODO: Query friendship repository to get actual friends
        // For now, return all online users except self
        var onlineUsers = await GetOnlineUsersAsync();
        return onlineUsers.Where(u => u.UserId != userId).ToList();
    }

    public Task<bool> IsUserOnlineAsync(Guid userId)
    {
        return Task.FromResult(_users.ContainsKey(userId));
    }

    public Task<IDictionary<Guid,bool>> AreUsersOnlineAsync(IEnumerable<Guid> userIds)
    {
        Dictionary<Guid, bool> dict = new();
        foreach (var userId in userIds)
            dict[userId] = _users.ContainsKey(userId);
        return Task.FromResult<IDictionary<Guid, bool>>(dict);
    }

    public Task<UserPresenceInfo?> GetUserByConnectionIdAsync(string connectionId)
    {
        _connections.TryGetValue(connectionId, out var userInfo);
        return Task.FromResult(userInfo);
    }
}
