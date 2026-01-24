using Application.DTOs.Presence;
using Application.Interfaces.Realtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using UI.Utilities;

namespace UI.Hubs;

/// <summary>
/// SignalR hub for real-time presence tracking (online/offline status)
/// </summary>
[Authorize]
public class PresenceHub : Hub<IPresenceClient>
{
    private readonly IPresenceService _presenceService;
    private readonly ILogger<PresenceHub> _logger;

    public PresenceHub(
        IPresenceService presenceService,
        ILogger<PresenceHub> logger)
    {
        _presenceService = presenceService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetUserGuid();
        var connectionId = Context.ConnectionId;

        _logger.LogInformation(
            "User {UserId} connected to PresenceHub with connectionId {ConnectionId}",
            userId, connectionId);

        // Mark user as online
        var userInfo = await _presenceService.UserConnectedAsync(userId, connectionId);

        // Join personal group for this user (for targeted notifications)
        await Groups.AddToGroupAsync(connectionId, $"user_{userId}");

        // If this is user's first connection, notify all friends
        if (userInfo.ConnectionIds.Count == 1)
        {
            _logger.LogInformation("User {UserId} came online", userId);

            // Broadcast to all other clients that subscribed to this user that they are online
            await Clients.OthersInGroup($"user_{userId}").UserOnline(userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        var userInfo = await _presenceService.GetUserByConnectionIdAsync(connectionId);

        if (userInfo != null)
        {
            _logger.LogInformation(
                "User {UserId} disconnected from PresenceHub with connectionId {ConnectionId}",
                userInfo.UserId, connectionId);

            // Remove connection and check if user went fully offline
            var wentOffline = await _presenceService.UserDisconnectedAsync(connectionId);

            if (wentOffline)
            {
                _logger.LogInformation("User {UserId} went offline", userInfo.UserId);
                
                // Notify all clients that user is offline
                await Clients.Others.UserOffline(userInfo.UserId);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Client can request updated list of online users
    /// </summary>
    public async Task GetOnlineUsers()
    {
        var onlineUsers = await _presenceService.GetOnlineUsersAsync();
        var onlineDtos = onlineUsers.Select(u => new OnlineUserDto
        {
            UserId = u.UserId,
            ConnectedAt = u.ConnectedAt
        }).ToList();

        await Clients.Caller.OnlineUsers(onlineDtos);
    }

    /// <summary>
    /// Subscribe to presence updates for specific users (e.g., friends)
    /// Immediately returns their current online status
    /// </summary>
    public async Task<IDictionary<Guid,bool>> SubscribeToUsers(List<Guid> userIds)
    {
        var tasks=userIds.Select(async userId=> await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}"));
        await Task.WhenAll(tasks);

        _logger.LogInformation(
            "User {UserId} subscribed to {Count} users' presence",
            Context.GetUserGuid(), userIds.Count);

        return await _presenceService.AreUsersOnlineAsync(userIds);
    }
}
