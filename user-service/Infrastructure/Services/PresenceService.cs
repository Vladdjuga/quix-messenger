using Application.Common;
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

    public Task<Result<UserPresenceInfo>> UserConnectedAsync(Guid userId, string connectionId)
    {
        try
        {
            if (userId == Guid.Empty)
                return Task.FromResult(Result<UserPresenceInfo>.Failure("UserId cannot be empty"));
            
            if (string.IsNullOrWhiteSpace(connectionId))
                return Task.FromResult(Result<UserPresenceInfo>.Failure("ConnectionId cannot be empty"));

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

            return Task.FromResult(Result<UserPresenceInfo>.Success(existingUser));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<UserPresenceInfo>.Failure($"Failed to connect user: {ex.Message}"));
        }
    }

    public Task<Result<bool>> UserDisconnectedAsync(string connectionId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                return Task.FromResult(Result<bool>.Failure("ConnectionId cannot be empty"));

            if (!_connections.TryRemove(connectionId, out var userInfo))
                return Task.FromResult(Result<bool>.Success(false)); // Connection not found, but not an error

            // Remove connection from user's list
            lock (userInfo.ConnectionIds)
            {
                userInfo.ConnectionIds.Remove(connectionId);
                
                // If no more connections, remove user completely
                if (userInfo.ConnectionIds.Count != 0)
                    return Task.FromResult(Result<bool>.Success(false)); // User still has other connections
                    
                _users.TryRemove(userInfo.UserId, out _);
                return Task.FromResult(Result<bool>.Success(true)); // User went offline
            }
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<bool>.Failure($"Failed to disconnect user: {ex.Message}"));
        }
    }

    public Task<Result<List<UserPresenceInfo>>> GetOnlineUsersAsync()
    {
        try
        {
            var users = _users.Values.ToList();
            return Task.FromResult(Result<List<UserPresenceInfo>>.Success(users));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<List<UserPresenceInfo>>.Failure($"Failed to get online users: {ex.Message}"));
        }
    }

    public async Task<Result<List<UserPresenceInfo>>> GetOnlineFriendsAsync(Guid userId)
    {
        try
        {
            if (userId == Guid.Empty)
                return Result<List<UserPresenceInfo>>.Failure("UserId cannot be empty");

            // TODO: Query friendship repository to get actual friends
            // For now, return all online users except self
            var onlineUsersResult = await GetOnlineUsersAsync();
            
            if (!onlineUsersResult.IsSuccess)
                return onlineUsersResult;

            var friends = onlineUsersResult.Value.Where(u => u.UserId != userId).ToList();
            return Result<List<UserPresenceInfo>>.Success(friends);
        }
        catch (Exception ex)
        {
            return Result<List<UserPresenceInfo>>.Failure($"Failed to get online friends: {ex.Message}");
        }
    }

    public Task<Result<bool>> IsUserOnlineAsync(Guid userId)
    {
        try
        {
            if (userId == Guid.Empty)
                return Task.FromResult(Result<bool>.Failure("UserId cannot be empty"));

            var isOnline = _users.ContainsKey(userId);
            return Task.FromResult(Result<bool>.Success(isOnline));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<bool>.Failure($"Failed to check user online status: {ex.Message}"));
        }
    }

    public Task<Result<IDictionary<Guid,bool>>> AreUsersOnlineAsync(IEnumerable<Guid> userIds)
    {
        try
        {
            var userIdsList = userIds.ToList();
            if (userIdsList.Any(id => id == Guid.Empty))
                return Task.FromResult(Result<IDictionary<Guid,bool>>.Failure("UserIds cannot contain empty GUIDs"));

            Dictionary<Guid, bool> dict = new();
            foreach (var userId in userIdsList)
                dict[userId] = _users.ContainsKey(userId);
                
            return Task.FromResult(Result<IDictionary<Guid,bool>>.Success(dict));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<IDictionary<Guid,bool>>.Failure($"Failed to check users online status: {ex.Message}"));
        }
    }

    public Task<Result<UserPresenceInfo>> GetUserByConnectionIdAsync(string connectionId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                return Task.FromResult(Result<UserPresenceInfo>.Failure("ConnectionId cannot be empty"));

            if (!_connections.TryGetValue(connectionId, out var userInfo))
                return Task.FromResult(Result<UserPresenceInfo>.Failure("User not found for connection"));

            return Task.FromResult(Result<UserPresenceInfo>.Success(userInfo));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<UserPresenceInfo>.Failure($"Failed to get user by connection: {ex.Message}"));
        }
    }
}
