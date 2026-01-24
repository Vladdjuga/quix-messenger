namespace Application.DTOs.Message.Realtime;

/// <summary>
/// DTO for broadcasting new message event to SignalR clients
/// Matches the structure expected by frontend (previously sent via Kafka/Socket.IO)
/// </summary>
public class NewMessageRealtimeDto
{
    public required string SenderId { get; set; }
    public required MessageRealtimeDto Message { get; set; }
}

public class MessageRealtimeDto
{
    public required string Id { get; set; }
    public required string ChatId { get; set; }
    public required string Text { get; set; }
    public required string UserId { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required int Status { get; set; }
    public required IEnumerable<MessageAttachmentRealtimeDto> Attachments { get; set; }
}

public class MessageAttachmentRealtimeDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string ContentType { get; set; }
    public required long Size { get; set; }
    public required string Url { get; set; }
}
