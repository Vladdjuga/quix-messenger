using Application.Interfaces;

namespace Application.DTOs.Message;

public class DeleteMessagePayload : IBroadcastPayload
{
    public required string MessageId { get; set; }
    public required string ChatId { get; set; }
    public required string SenderId { get; set; }
    public string GetEventType() => "Deleted Message";
    public string GetPartitionKey() => ChatId;
    public Dictionary<string, object> GetLogMetadata() => new()
    {
        { "MessageId", MessageId},
        { "ChatId", ChatId }
    };
}
