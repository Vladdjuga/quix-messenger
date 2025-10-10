using Application.DTOs.Message;
using Application.Interfaces;
using Application.Interfaces.Notification;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class RealtimeNotificationService : INotificationService
{
    private readonly IKafkaProducerService _kafkaProducer;
    private readonly ILogger<RealtimeNotificationService> _logger;
    private const string TopicName = "messenger.events.newMessage";

    public RealtimeNotificationService(
        IKafkaProducerService kafkaProducer,
        ILogger<RealtimeNotificationService> logger)
    {
        _kafkaProducer = kafkaProducer;
        _logger = logger;
    }

    public async Task BroadcastNewMessageAsync(ReadMessageDto message, CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new BroadcastMessagePayload
            (
                message.ChatId,
                new BroadcastMessageDto
                (
                    message.Id,
                    message.ChatId,
                    message.Text,
                    message.UserId,
                    message.CreatedAt,
                    message.Status,
                    message.Attachments ?? new List<MessageAttachmentDto>()
                )
            );

            // Partition by chatId for ordered delivery within each chat
            var partitionKey = message.ChatId.ToString();
            
            await _kafkaProducer.PublishAsync(TopicName, partitionKey, payload, cancellationToken);
            
            _logger.LogInformation(
                "Published new message event to Kafka: MessageId={MessageId}, ChatId={ChatId}", 
                message.Id, 
                message.ChatId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Error publishing message event to Kafka: MessageId={MessageId}, ChatId={ChatId}", 
                message.Id, 
                message.ChatId);
            // Don't throw - message is already saved in DB
        }
    }
}
