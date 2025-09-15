using Domain.Entities;

namespace Domain.Repositories;

public interface IMessageRepository
{
    Task AddMessageAsync(MessageEntity message);
    Task AddMessageAsync(IEnumerable<MessageEntity> messages);
    Task<IEnumerable<MessageEntity>> GetMessagesAsync();
    Task<IEnumerable<MessageEntity>> GetMessagesByChatIdAsync(Guid chatId);
    Task<IEnumerable<MessageEntity>> GetMessagesAsync(Guid? userId, Guid? chatId, int count,
        CancellationToken cancellationToken);
    Task<IEnumerable<MessageEntity>> GetMessagesPaginatedAsync(Guid? userId, Guid? chatId,
        DateTime lastCreatedAt,
        int pageSize, CancellationToken cancellationToken);
}
