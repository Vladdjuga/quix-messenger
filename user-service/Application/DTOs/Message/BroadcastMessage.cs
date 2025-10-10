using Domain.Enums;

namespace Application.DTOs.Message;

public record BroadcastMessagePayload(Guid ChatId, BroadcastMessageDto Message);

public record BroadcastMessageDto(
    Guid Id,
    Guid ChatId,
    string Text,
    Guid UserId,
    DateTime CreatedAt,
    MessageStatus Status,
    IEnumerable<MessageAttachmentDto> Attachments
);