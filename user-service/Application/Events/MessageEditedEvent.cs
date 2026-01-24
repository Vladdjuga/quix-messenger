namespace Application.Events;

/// <summary>
/// Event published when a message is edited.
/// Will be consumed to broadcast via SignalR.
/// </summary>
public class MessageEditedEvent
{
    public required Guid MessageId { get; init; }
    public required Guid ChatId { get; init; }
    public required string Text { get; init; }
    public required Guid UserId { get; init; }
    public required int Status { get; init; }
}
