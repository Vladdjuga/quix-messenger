namespace Application.DTOs.Message.Realtime;

/// <summary>
/// DTO for broadcasting message edited event to SignalR clients
/// Matches the structure expected by frontend (previously sent via Kafka/Socket.IO)
/// </summary>
public class MessageEditedRealtimeDto
{
    public required string SenderId { get; set; }
    public required EditedMessageDataDto Message { get; set; }
}

public class EditedMessageDataDto
{
    public required string Id { get; set; }
    public required string ChatId { get; set; }
    public required string Text { get; set; }
    public required int Status { get; set; }
}
