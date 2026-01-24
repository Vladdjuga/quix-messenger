namespace Application.DTOs.Message.Realtime;

/// <summary>
/// DTO for broadcasting message deleted event to SignalR clients
/// Matches the structure expected by frontend (previously sent via Kafka/Socket.IO)
/// </summary>
public class MessageDeletedRealtimeDto
{
    public required string MessageId { get; set; }
    public required string ChatId { get; set; }
    public required string SenderId { get; set; }
}
