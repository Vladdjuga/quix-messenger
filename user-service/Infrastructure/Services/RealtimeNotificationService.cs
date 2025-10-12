using Application.DTOs.Message;
using Application.Interfaces;
using Application.Interfaces.Notification;
using Infrastructure.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class RealtimeNotificationService : INotificationService
{
    private readonly IKafkaProducerService _kafkaProducer;
    private readonly ILogger<RealtimeNotificationService> _logger;
    private readonly KafkaTopicsOptions _kafkaTopics;

    public RealtimeNotificationService(
        IKafkaProducerService kafkaProducer,
        ILogger<RealtimeNotificationService> logger,
        KafkaTopicsOptions kafkaTopics)
    {
        _kafkaProducer = kafkaProducer;
        _logger = logger;
        _kafkaTopics = kafkaTopics;
    }

    private async Task BroadcastAsync(IBroadcastPayload payload, string topic, CancellationToken cancellationToken)
    {
        var partitionKey = payload.GetPartitionKey();
        var logMetadata = payload.GetLogMetadata();
        var eventType = payload.GetEventType();

        logMetadata["Topic"] = topic;
        logMetadata["PartitionKey"] = partitionKey;

        using (_logger.BeginScope(logMetadata))
        {
            try
            {
                await _kafkaProducer.PublishAsync(topic, partitionKey, payload, cancellationToken);
                _logger.LogInformation("Successfully published {EventType} event to Kafka.", eventType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing {EventType} event to Kafka.", eventType);
            }
        }
    }

    public Task BroadcastNewMessageAsync(ReadMessageDto message, CancellationToken cancellationToken = default)
    {
        var payload = new NewMessagePayload
        {
            Message = new BroadcastMessageDto
            (
                message.Id,
                message.ChatId,
                message.Text,
                message.UserId,
                message.CreatedAt,
                message.Status,
                message.Attachments ?? new List<MessageAttachmentDto>()
            )
        };

        return BroadcastAsync(payload, _kafkaTopics.NewMessage, cancellationToken);
    }

    public Task BroadcastMessageDeletedAsync(ReadMessageDto dto, CancellationToken cancellationToken = default)
    {
        var payload = new DeleteMessagePayload
        {
            MessageId = dto.Id.ToString(),
            ChatId = dto.ChatId.ToString(),
            SenderId = dto.UserId.ToString()
        };

        return BroadcastAsync(payload, _kafkaTopics.DeleteMessage, cancellationToken);
    }

    public Task BroadcastMessageEditedAsync(ReadMessageDto dto, CancellationToken cancellationToken = default)
    {
        var payload = new EditedMessagePayload
        {
            SenderId = dto.UserId.ToString(),
            Message = new BroadcastEditedMessage
            {
                Id = dto.Id.ToString(),
                ChatId = dto.ChatId.ToString(),
                Text = dto.Text,
                Status = (int)dto.Status
            }
        };

        return BroadcastAsync(payload, _kafkaTopics.EditMessage, cancellationToken);
    }
}
