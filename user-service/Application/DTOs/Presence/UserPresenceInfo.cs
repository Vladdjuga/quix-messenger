namespace Application.DTOs.Presence;

/// <summary>
/// Internal model for tracking user presence information
/// Contains all connection IDs for a user (supports multiple tabs/devices)
/// </summary>
public class UserPresenceInfo
{
    public required Guid UserId { get; init; }
    public required DateTime ConnectedAt { get; init; }
    public required List<string> ConnectionIds { get; init; } // Multiple tabs/devices
}
