using Application.DTOs.Presence;

namespace Application.Interfaces.Realtime;

/// <summary>
/// Client interface for presence notifications via SignalR
/// </summary>
public interface IPresenceClient
{
    /// <summary>
    /// Notifies client that a user has come online
    /// </summary>
    Task UserOnline(Guid userId);
    
    /// <summary>
    /// Notifies client that a user has gone offline
    /// </summary>
    Task UserOffline(Guid userId);
    
    /// <summary>
    /// Sends the list of currently online users (initial load)
    /// </summary>
    Task OnlineUsers(List<OnlineUserDto> users);
}
