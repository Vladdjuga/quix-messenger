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
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesByChatIdAsync(Guid chatId)
    {
        return await _dbSet.AsNoTracking()
            .Where(m => m.ChatId == chatId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesAsync(Guid chatId, int count, CancellationToken cancellationToken)
    {
        var query = await _dbSet.Where(m => m.ChatId == chatId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
        return query;
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesPaginatedAsync(Guid chatId, DateTime lastCreatedAt, int pageSize, CancellationToken cancellationToken)
    {
        var query = await _dbSet.Where(m => m.ChatId == chatId)
            .Where(m => m.CreatedAt < lastCreatedAt)
            .OrderByDescending(m => m.CreatedAt)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return query;
    }

    public async Task<MessageEntity?> GetByIdAsync(Guid messageId, CancellationToken cancellationToken)
    {
        return await _dbSet.FirstOrDefaultAsync(m => m.Id == messageId, cancellationToken);
    }

    public async Task DeleteAsync(MessageEntity entity, CancellationToken cancellationToken)
    {
        _dbSet.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(MessageEntity entity, CancellationToken cancellationToken)
    {
        _dbSet.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
