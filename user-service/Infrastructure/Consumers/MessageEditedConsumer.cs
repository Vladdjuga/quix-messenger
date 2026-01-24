using Application.DTOs.Message;
using Application.Events;
using Application.Interfaces.Notification;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Consumers;

/// <summary>
/// Consumes MessageEditedEvent from RabbitMQ and broadcasts via INotificationService
/// </summary>
public class MessageEditedConsumer : IConsumer<MessageEditedEvent>
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<MessageEditedConsumer> _logger;

    public MessageEditedConsumer(
        INotificationService notificationService,
        ILogger<MessageEditedConsumer> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<MessageEditedEvent> context)
    {
        var @event = context.Message;
        
        _logger.LogInformation("Consuming MessageEditedEvent for message {MessageId} in chat {ChatId}", 
            @event.MessageId, @event.ChatId);

        try
        {
            var messageDto = new ReadMessageDto
            {
                Id = @event.MessageId,
                ChatId = @event.ChatId,
                Text = @event.Text,
                UserId = @event.UserId,
                CreatedAt = DateTime.UtcNow, // We don't have CreatedAt in edit event
                Status = (Domain.Enums.MessageStatus)@event.Status,
                Attachments = null
            };

            await _notificationService.BroadcastMessageEditedAsync(messageDto, context.CancellationToken);
            
            _logger.LogInformation("Successfully broadcast message edited {MessageId}", @event.MessageId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error consuming MessageEditedEvent for message {MessageId}", @event.MessageId);
            throw;
        }
    }
}
