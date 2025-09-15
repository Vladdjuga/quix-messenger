using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly MessengerDbContext _dbContext;
    private readonly DbSet<MessageEntity> _dbSet;

    public MessageRepository(MessengerDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<MessageEntity>();
    }

    public async Task AddMessageAsync(MessageEntity message)
    {
        await _dbSet.AddAsync(message);
        await _dbContext.SaveChangesAsync();
    }

    public async Task AddMessageAsync(IEnumerable<MessageEntity> messages)
    {
        await _dbSet.AddRangeAsync(messages);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesAsync()
    {
        return await _dbSet.AsNoTracking()
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesByChatIdAsync(Guid chatId)
    {
        return await _dbSet.AsNoTracking()
            .Where(m => m.ChatId == chatId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesAsync(Guid? userId, Guid? chatId, int count, CancellationToken cancellationToken)
    {
        IQueryable<MessageEntity> query = _dbSet.AsNoTracking();
        if (userId.HasValue)
            query = query.Where(m => m.UserId == userId.Value);
        if (chatId.HasValue)
            query = query.Where(m => m.ChatId == chatId.Value);

        return await query
            .OrderByDescending(m => m.SentAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesPaginatedAsync(Guid? userId, Guid? chatId, DateTime lastCreatedAt, int pageSize, CancellationToken cancellationToken)
    {
        IQueryable<MessageEntity> query = _dbSet.AsNoTracking();
        if (userId.HasValue)
            query = query.Where(m => m.UserId == userId.Value);
        if (chatId.HasValue)
            query = query.Where(m => m.ChatId == chatId.Value);

        // Keyset pagination by SentAt
        query = query.Where(m => m.SentAt < lastCreatedAt)
            .OrderByDescending(m => m.SentAt)
            .Take(pageSize);

        return await query.ToListAsync(cancellationToken);
    }
}
