using Application.DTOs.Message;

namespace Application.Interfaces.Notification;

public interface INotificationService
{
    Task BroadcastNewMessageAsync(ReadMessageDto message, CancellationToken cancellationToken = default);
    Task BroadcastMessageDeletedAsync(ReadMessageDto dto, CancellationToken cancellationToken = default);
    Task BroadcastMessageEditedAsync(ReadMessageDto dto, CancellationToken cancellationToken = default);
}
