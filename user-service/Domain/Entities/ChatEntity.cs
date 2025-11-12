using Domain.Enums;

namespace Domain.Entities;

public class ChatEntity
{
    public Guid Id { get; init; }
    public required string Title { get; init; }
    public required ChatType ChatType { get; init; }
    public required string? AvatarUrl { get; set; }
    public required DateTime CreatedAt { get; init; }
    public IEnumerable<UserChatEntity> UserChatEntities { get; init; } = new List<UserChatEntity>();
    public IEnumerable<MessageEntity> Messages { get; init; } = new List<MessageEntity>();
}