namespace Application.Events;

/// <summary>
/// Event published when a message is deleted.
/// Will be consumed to broadcast via SignalR.
/// </summary>
public class MessageDeletedEvent
{
    public required Guid MessageId { get; init; }
    public required Guid ChatId { get; init; }
    public required Guid UserId { get; init; }
}
