using Application.DTOs.Message;
using Application.Events;
using Application.Interfaces.Notification;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Consumers;

/// <summary>
/// Consumes MessageCreatedEvent from RabbitMQ and broadcasts via INotificationService
/// </summary>
public class MessageCreatedConsumer : IConsumer<MessageCreatedEvent>
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<MessageCreatedConsumer> _logger;

    public MessageCreatedConsumer(
        INotificationService notificationService,
        ILogger<MessageCreatedConsumer> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<MessageCreatedEvent> context)
    {
        var @event = context.Message;
        
        _logger.LogInformation("Consuming MessageCreatedEvent for message {MessageId} in chat {ChatId}", 
            @event.MessageId, @event.ChatId);

        try
        {
            var messageDto = new ReadMessageDto
            {
                Id = @event.MessageId,
                ChatId = @event.ChatId,
                Text = @event.Text,
                UserId = @event.UserId,
                CreatedAt = @event.CreatedAt,
                Status = (Domain.Enums.MessageStatus)@event.Status,
                Attachments = @event.Attachments?.Select(a => new MessageAttachmentDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    ContentType = a.ContentType,
                    Size = a.Size,
                    Url = a.Url
                })
            };

            await _notificationService.BroadcastNewMessageAsync(messageDto, context.CancellationToken);
            
            _logger.LogInformation("Successfully broadcast new message {MessageId}", @event.MessageId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error consuming MessageCreatedEvent for message {MessageId}", @event.MessageId);
            throw;
        }
    }
}
