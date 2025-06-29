﻿using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class UserSessionRepository:IUserSessionRepository
{
    private readonly MessengerDbContext _dbContext;
    private readonly DbSet<UserSessionEntity> _dbSet;
    public UserSessionRepository(MessengerDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<UserSessionEntity>();
    }
    public async Task<UserSessionEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(us => us.Id == id, cancellationToken);
    }

    public async Task<UserSessionEntity?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(us => us.UserId == userId, cancellationToken);
    }
    public async Task AddAsync(UserSessionEntity userSession, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(userSession);
        await _dbSet.AddAsync(userSession, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(UserSessionEntity userSession, CancellationToken cancellationToken)
    {
        var existingEntity = await _dbContext.UserSessions
            .FirstOrDefaultAsync(x => x.Id == userSession.Id, cancellationToken);
        ArgumentNullException.ThrowIfNull(existingEntity);
        _dbContext.Entry(existingEntity).CurrentValues.SetValues(userSession);
        _dbContext.Entry(existingEntity).Property(x => x.Id).IsModified = false;
        _dbContext.Entry(existingEntity).Property(x => x.CreatedAt).IsModified = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var userSession = await _dbSet.FindAsync([id], cancellationToken);
        ArgumentNullException.ThrowIfNull(userSession);
        _dbSet.Remove(userSession);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        var userSession = await _dbSet
            .FirstOrDefaultAsync(us => us.UserId == userId, cancellationToken);
        ArgumentNullException.ThrowIfNull(userSession);
        _dbSet.Remove(userSession);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<UserSessionEntity>> GetValidSessionsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(us => us.UserId == userId && us.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(cancellationToken);
    }
}