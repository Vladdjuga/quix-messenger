using Application.DTOs.Message;
using Application.DTOs.Message.Realtime;
using Application.Interfaces.Notification;
using Application.Interfaces.Realtime;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using UI.Hubs;

namespace UI.Services;

/// <summary>
/// SignalR-based implementation of INotificationService using Adapter pattern.
/// Broadcasts real-time notifications to connected clients via SignalR hubs.
/// </summary>
public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<ChatHub, IChatClient> _chatHubContext;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        IHubContext<ChatHub, IChatClient> chatHubContext,
        ILogger<SignalRNotificationService> logger)
    {
        _chatHubContext = chatHubContext;
        _logger = logger;
    }

    public async Task BroadcastNewMessageAsync(ReadMessageDto message, CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new NewMessageRealtimeDto
            {
                SenderId = message.UserId.ToString(),
                Message = new MessageRealtimeDto
                {
                    Id = message.Id.ToString(),
                    ChatId = message.ChatId.ToString(),
                    Text = message.Text,
                    UserId = message.UserId.ToString(),
                    CreatedAt = message.CreatedAt,
                    Status = (int)message.Status,
                    Attachments = message.Attachments?.Select(a => new MessageAttachmentRealtimeDto
                    {
                        Id = a.Id.ToString(),
                        Name = a.Name,
                        ContentType = a.ContentType,
                        Size = a.Size,
                        Url = a.Url
                    }) ?? Enumerable.Empty<MessageAttachmentRealtimeDto>()
                }
            };

            _logger.LogInformation("Broadcasting new message {MessageId} to chat {ChatId}", 
                message.Id, message.ChatId);

            await _chatHubContext.Clients
                .Group(message.ChatId.ToString())
                .NewMessage(payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting new message {MessageId}", message.Id);
            throw;
        }
    }

    public async Task BroadcastMessageDeletedAsync(ReadMessageDto dto, CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new MessageDeletedRealtimeDto
            {
                MessageId = dto.Id.ToString(),
                ChatId = dto.ChatId.ToString(),
                SenderId = dto.UserId.ToString()
            };

            _logger.LogInformation("Broadcasting message deleted {MessageId} to chat {ChatId}", 
                dto.Id, dto.ChatId);

            await _chatHubContext.Clients
                .Group(dto.ChatId.ToString())
                .MessageDeleted(payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting message deleted {MessageId}", dto.Id);
            throw;
        }
    }

    public async Task BroadcastMessageEditedAsync(ReadMessageDto dto, CancellationToken cancellationToken = default)
    {
        try
        {
            var payload = new MessageEditedRealtimeDto
            {
                SenderId = dto.UserId.ToString(),
                Message = new EditedMessageDataDto
                {
                    Id = dto.Id.ToString(),
                    ChatId = dto.ChatId.ToString(),
                    Text = dto.Text,
                    Status = (int)dto.Status
                }
            };

            _logger.LogInformation("Broadcasting message edited {MessageId} to chat {ChatId}", 
                dto.Id, dto.ChatId);

            await _chatHubContext.Clients
                .Group(dto.ChatId.ToString())
                .MessageEdited(payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting message edited {MessageId}", dto.Id);
            throw;
        }
    }
}
