using Application.Common;
using Application.DTOs.Message;
using Application.Interfaces.Notification;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.UseCases.Messages.Commands;

/// <summary>
/// Command to publish a complete message with attachments to Kafka.
/// This should be called after message and attachments are persisted to DB.
/// </summary>
public record PublishMessageToKafkaCommand(Guid MessageId) : IRequest<Result<Unit>>;

public class PublishMessageToKafkaHandler : IRequestHandler<PublishMessageToKafkaCommand, Result<Unit>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageAttachmentRepository _attachmentRepository;
    private readonly INotificationService _notificationService;
    private readonly ILogger<PublishMessageToKafkaHandler> _logger;

    public PublishMessageToKafkaHandler(
        IMessageRepository messageRepository,
        IMessageAttachmentRepository attachmentRepository,
        INotificationService notificationService,
        ILogger<PublishMessageToKafkaHandler> logger)
    {
        _messageRepository = messageRepository;
        _attachmentRepository = attachmentRepository;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(PublishMessageToKafkaCommand request, CancellationToken cancellationToken)
    {
        // Get message from DB
        var message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
        if (message == null)
        {
            _logger.LogWarning("Message {MessageId} not found for Kafka publishing", request.MessageId);
            return Result<Unit>.Failure($"Message {request.MessageId} not found");
        }

        // Get all attachments for this message
        var attachments = await _attachmentRepository.GetByMessageIdAsync(request.MessageId, cancellationToken);
        
        // Map to DTO
        var messageDto = new ReadMessageDto
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

        // Publish to Kafka
        try
        {
            await _notificationService.BroadcastNewMessageAsync(messageDto, cancellationToken);
            _logger.LogInformation(
                "Successfully published message {MessageId} with {AttachmentCount} attachments to Kafka",
                request.MessageId, messageDto.Attachments.Count());
            return Result<Unit>.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish message {MessageId} to Kafka", request.MessageId);
            return Result<Unit>.Failure($"Failed to publish message to Kafka: {ex.Message}");
        }
    }
}
