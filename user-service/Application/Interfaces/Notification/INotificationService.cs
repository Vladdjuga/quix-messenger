using Application.DTOs.Message;

namespace Application.Interfaces.Notification;

public interface INotificationService
{
    Task BroadcastNewMessageAsync(ReadMessageDto message, CancellationToken cancellationToken = default);
}
