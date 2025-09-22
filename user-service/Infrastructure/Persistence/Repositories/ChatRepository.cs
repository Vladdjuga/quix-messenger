using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class ChatRepository:IChatRepository
{
    private readonly MessengerDbContext _dbContext;
    private readonly DbSet<ChatEntity> _dbSet;
    public ChatRepository(MessengerDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<ChatEntity>();
    }
    public async Task<IEnumerable<ChatEntity>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _dbSet.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<ChatEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbSet.FindAsync([id],cancellationToken);
    }

    public async Task<bool> AnyByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbSet.AnyAsync(e => e.Id == id, cancellationToken);
    }

    public async Task AddAsync(ChatEntity entity, CancellationToken cancellationToken)
    {
        await _dbSet.AddAsync(entity,cancellationToken); 
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ChatEntity entity, CancellationToken cancellationToken)
    {
        var existingEntity = await _dbContext.Chats
            .FirstOrDefaultAsync(x => x.Id == entity.Id, cancellationToken);

        if (existingEntity is null)
            throw new Exception("Chat not found");
        
        _dbContext.Entry(existingEntity).CurrentValues.SetValues(entity);
        _dbContext.Entry(existingEntity).Property(x => x.CreatedAt).IsModified = false;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await GetByIdAsync(id,cancellationToken);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}