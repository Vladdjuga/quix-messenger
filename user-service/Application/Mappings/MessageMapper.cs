using Application.DTOs.Message;
using Application.Events;
using Domain.Entities;

namespace Application.Mappings;

/// <summary>
/// Mapper for message entities to DTOs and events
/// </summary>
public static class MessageMapper
{
    public static MessageCreatedEvent MapToEvent(
        MessageEntity message, 
        IEnumerable<MessageAttachmentEntity> attachments)
    {
        return new MessageCreatedEvent
        {
            MessageId = message.Id,
            ChatId = message.ChatId,
            Text = message.Text,
            UserId = message.UserId,
            CreatedAt = message.CreatedAt,
            Status = (int)message.Status,
            Attachments = attachments.Select(a => new MessageAttachmentEventDto
            {
                Id = a.Id,
                Name = a.FileName,
                ContentType = a.MimeType,
                Size = a.FileSize,
                Url = $"/api/Attachment/download/{a.Id}"
            }).ToList()
        };
    }

    public static ReadMessageDto MapToDto(
        MessageEntity message, 
        IEnumerable<MessageAttachmentEntity> attachments)
    {
        return new ReadMessageDto
        {
            Id = message.Id,
            ChatId = message.ChatId,
            Text = message.Text,
            UserId = message.UserId,
            CreatedAt = message.CreatedAt,
            Status = message.Status,
            Attachments = attachments.Select(a => new MessageAttachmentDto
            {
                Id = a.Id,
                Name = a.FileName,
                ContentType = a.MimeType,
                Size = a.FileSize,
                Url = $"/api/Attachment/download/{a.Id}"
            }).ToList()
        };
    }
}
