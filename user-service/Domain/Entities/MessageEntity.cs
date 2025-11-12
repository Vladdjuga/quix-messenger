using Domain.Enums;

namespace Domain.Entities;

public class MessageEntity
{
    public Guid Id { get; init; }
    public required Guid ChatId { get; init; }
    public ChatEntity? Chat { get; init; }

    public required Guid UserId { get; init; }
    public UserEntity? User { get; init; }

    public required string Text { get; set; }
    public ICollection<MessageAttachmentEntity> Attachments { get; init; } = new List<MessageAttachmentEntity>();
    public required DateTime CreatedAt { get; init; }
    public required MessageStatus Status { get; set; }
}

