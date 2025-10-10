using System.Text;
using System.Text.Json;
using Application.DTOs.Message;
using Application.Interfaces.Notification;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class RealtimeNotificationService : INotificationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<RealtimeNotificationService> _logger;
    private readonly string? _realtimeServiceUrl;

    public RealtimeNotificationService(
        IHttpClientFactory httpClientFactory,
        ILogger<RealtimeNotificationService> logger,
        IConfiguration configuration)
    {
        _httpClient = httpClientFactory.CreateClient("RealtimeService");
        _logger = logger;
        _realtimeServiceUrl = configuration["REALTIME_SERVICE_URL"] ?? configuration["RealtimeService:BaseUrl"];
    }

    public async Task BroadcastNewMessageAsync(ReadMessageDto message, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_realtimeServiceUrl))
        {
            _logger.LogWarning("REALTIME_SERVICE_URL not configured, skipping broadcast");
            return;
        }

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

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(
                $"{_realtimeServiceUrl}/api/broadcast/newMessage",
                content,
                cancellationToken
            );

            if (!response.IsSuccessStatusCode)
                _logger.LogWarning(
                    "Failed to broadcast message {MessageId} to realtime-service. Status: {StatusCode}",
                    message.Id,
                    response.StatusCode
                );
            else
                _logger.LogInformation("Successfully broadcast message {MessageId} to chat {ChatId}", message.Id, message.ChatId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting message {MessageId} to realtime-service", message.Id);
        }
    }
}
