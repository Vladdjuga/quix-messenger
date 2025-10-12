using Application.Interfaces;
using Domain.Enums;

namespace Application.DTOs.Message;

public class NewMessagePayload : IBroadcastPayload
{
    public BroadcastMessageDto Message { get; set; } = default!;
    public string ChatId => Message.ChatId.ToString();

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
    MessageStatus Status,
    IEnumerable<MessageAttachmentDto> Attachments
);