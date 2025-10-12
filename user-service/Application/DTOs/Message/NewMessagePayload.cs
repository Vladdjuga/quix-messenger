using Application.Interfaces;
using Domain.Enums;
using System.Text.Json.Serialization;

namespace Application.DTOs.Message;

public class NewMessagePayload : IBroadcastPayload
{
    public BroadcastMessageDto Message { get; set; } = default!;
    
    // This property is computed and should not be serialized
    [JsonIgnore]
    public string ChatId => Message.ChatId.ToString();

    // Methods are not serialized by System.Text.Json, no attribute needed
    public string GetEventType() => "New Message";
    public string GetPartitionKey() => ChatId;
    public Dictionary<string, object> GetLogMetadata() => new()
    {
        { "MessageId", Message.Id },
        { "ChatId", Message.ChatId }
    };
}

public record BroadcastMessageDto(
    Guid Id,
    Guid ChatId,
    string Text,
    Guid UserId,
    DateTime CreatedAt,
    int Status,// Not MessageStatus because json serializes it to string by default.
    IEnumerable<MessageAttachmentDto> Attachments
);