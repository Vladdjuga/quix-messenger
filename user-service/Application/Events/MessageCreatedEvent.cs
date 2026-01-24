namespace Application.Events;

/// <summary>
/// Event published when a new message is created.
/// Will be consumed to broadcast via SignalR.
/// </summary>
public class MessageCreatedEvent
{
    public required Guid MessageId { get; init; }
    public required Guid ChatId { get; init; }
    public required string Text { get; init; }
    public required Guid UserId { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required int Status { get; init; }
    public required IEnumerable<MessageAttachmentEventDto> Attachments { get; init; }
}

public class MessageAttachmentEventDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string ContentType { get; init; }
    public required long Size { get; init; }
    public required string Url { get; init; }
}
