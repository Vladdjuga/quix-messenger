using Application.Interfaces;

namespace Application.DTOs.Message;

public class EditedMessagePayload : IBroadcastPayload
{
    public required string SenderId { get; set; }
    public required BroadcastEditedMessage Message { get; set; }
    
    // Methods are not serialized by System.Text.Json
    public string GetEventType() => "Edited Message";
    public string GetPartitionKey() => Message.ChatId;
    public Dictionary<string, object> GetLogMetadata() => new()
    {
        { "MessageId", Message.Id },
        { "ChatId", Message.ChatId }
    };
}

public class BroadcastEditedMessage
{
    public required string Id { get; set; }
    public required string ChatId { get; set; }
    public required string Text { get; set; }
    public required int Status { get; set; }
}