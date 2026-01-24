using Application.DTOs.Message;
using Application.Events;
using Application.Interfaces.Notification;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Consumers;

/// <summary>
/// Consumes MessageDeletedEvent from RabbitMQ and broadcasts via INotificationService
/// </summary>
public class MessageDeletedConsumer : IConsumer<MessageDeletedEvent>
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<MessageDeletedConsumer> _logger;

    public MessageDeletedConsumer(
        INotificationService notificationService,
        ILogger<MessageDeletedConsumer> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<MessageDeletedEvent> context)
    {
        var @event = context.Message;
        
        _logger.LogInformation("Consuming MessageDeletedEvent for message {MessageId} in chat {ChatId}", 
            @event.MessageId, @event.ChatId);

        try
        {
            var messageDto = new ReadMessageDto
            {
                Id = @event.MessageId,
                ChatId = @event.ChatId,
                Text = string.Empty, // Not needed for deletion
                UserId = @event.UserId,
                CreatedAt = DateTime.UtcNow,
                Status = Domain.Enums.MessageStatus.Sent, // Status doesn't matter for deletion
                Attachments = null
            };

            await _notificationService.BroadcastMessageDeletedAsync(messageDto, context.CancellationToken);
            
            _logger.LogInformation("Successfully broadcast message deleted {MessageId}", @event.MessageId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error consuming MessageDeletedEvent for message {MessageId}", @event.MessageId);
            throw;
        }
    }
}
