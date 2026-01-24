using Application.Common;
using Application.DTOs.Message;
using Application.Events;
using Application.Interfaces.Events;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.UseCases.Messages.Commands;

/// <summary>
/// Command to publish a complete message with attachments to message broker.
/// This should be called after message and attachments are persisted to DB.
/// </summary>
public record PublishMessageToKafkaCommand(Guid MessageId) : IRequest<Result<Unit>>;

public class PublishMessageToKafkaHandler : IRequestHandler<PublishMessageToKafkaCommand, Result<Unit>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageAttachmentRepository _attachmentRepository;
    private readonly IEventPublisher _eventPublisher;
    private readonly ILogger<PublishMessageToKafkaHandler> _logger;

    public PublishMessageToKafkaHandler(
        IMessageRepository messageRepository,
        IMessageAttachmentRepository attachmentRepository,
        IEventPublisher eventPublisher,
        ILogger<PublishMessageToKafkaHandler> logger)
    {
        _messageRepository = messageRepository;
        _attachmentRepository = attachmentRepository;
        _eventPublisher = eventPublisher;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(PublishMessageToKafkaCommand request, CancellationToken cancellationToken)
    {
        // Get message from DB
        var message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);
        if (message == null)
        {
            _logger.LogWarning("Message {MessageId} not found for publishing", request.MessageId);
            return Result<Unit>.Failure($"Message {request.MessageId} not found");
        }

        // Get all attachments for this message
        var attachments = await _attachmentRepository.GetByMessageIdAsync(request.MessageId, cancellationToken);
        
        // Publish event to message broker
        try
        {
            await _eventPublisher.PublishAsync(new MessageCreatedEvent
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
            }, cancellationToken);
            
            _logger.LogInformation(
                "Successfully published message {MessageId} with {AttachmentCount} attachments",
                request.MessageId, attachments.Count());
            return Result<Unit>.Success(Unit.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish message {MessageId}", request.MessageId);
            return Result<Unit>.Failure($"Failed to publish message: {ex.Message}");
        }
    }
}
