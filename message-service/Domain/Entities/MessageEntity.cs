using Domain.Enums;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Entities;

public class MessageEntity
{
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime ReceivedAt { get; set; }
    public required string Text { get; set; }
    [BsonRepresentation(BsonType.String)]
    public required Guid UserId { get; set; }
    [BsonRepresentation(BsonType.String)]
    public required Guid ChatId { get; set; }
    [BsonRepresentation(BsonType.Int32)]
    public required MessageStatus Status { get; set; }
}