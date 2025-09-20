using Domain.Enums;

namespace Domain.Entities;

public class MessageEntity
{
    public Guid Id { get; init; }
    public required Guid ChatId { get; init; }
    public virtual ChatEntity? Chat { get; init; }

    public required Guid UserId { get; init; }
    public virtual UserEntity? User { get; init; }

    public required string Text { get; set; }
    public required DateTime CreatedAt { get; init; }
    public required MessageStatus Status { get; set; }
}
