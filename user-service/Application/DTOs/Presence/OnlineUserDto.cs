namespace Application.DTOs.Presence;

/// <summary>
/// DTO for online user information sent to clients via SignalR
/// </summary>
public class OnlineUserDto
{
    public required Guid UserId { get; init; }
    public required DateTime ConnectedAt { get; init; }
}
