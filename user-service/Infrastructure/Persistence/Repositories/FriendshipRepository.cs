using System.Linq.Expressions;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class FriendshipRepository:IFriendshipRepository
{
    private readonly MessengerDbContext _dbContext;
    private readonly DbSet<FriendshipEntity> _dbSet;

    public FriendshipRepository(MessengerDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<FriendshipEntity>();
    }
    public async Task<IEnumerable<FriendshipEntity>> GetAllUsersFriendshipsAsync(Guid id,
        DateTime? lastCreatedAt, int pageSize,
        CancellationToken cancellationToken)
    {
        // Get friendships where user is either UserId or FriendId (bidirectional search)
        var friendships = await _dbSet.Where(
                el => (el.UserId == id || el.FriendId == id) 
                    && el.Status == FriendshipStatus.Active
                    && (lastCreatedAt == null || el.CreatedAt < lastCreatedAt)
                )
            .OrderByDescending(el => el.CreatedAt)
            .Take(pageSize)
            .Include(el=>el.Friend)
            .Include(el=>el.User)
            .ToListAsync(cancellationToken);

        return friendships;
    }

    public async Task<FriendshipEntity?> GetFriendshipAsync(Guid userId, Guid friendId,
        CancellationToken cancellationToken)
    {
        // Search in both directions: (userId, friendId) or (friendId, userId)
        var friendship = await _dbSet.Where(el => 
                (el.UserId == userId && el.FriendId == friendId) ||
                (el.UserId == friendId && el.FriendId == userId))
            .Include(el => el.Friend)
            .Include(el => el.User)
            .FirstOrDefaultAsync(cancellationToken);
        return friendship;
    }

    public async Task<FriendshipEntity?> GetFriendshipAsync(Guid userId, Guid friendId,
        CancellationToken cancellationToken,
        Func<IQueryable<FriendshipEntity>, IQueryable<FriendshipEntity>>? include)
    {
        var query = _dbSet.Where(el => 
            el.UserId == userId && el.FriendId == friendId);
        if (include is not null)
            query = include(query);
        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(FriendshipEntity friendshipEntity, CancellationToken cancellationToken)
    {
        await _dbSet.AddAsync(friendshipEntity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(FriendshipEntity friendshipEntity, CancellationToken cancellationToken)
    {
        var existingEntity = await _dbSet.FirstOrDefaultAsync(x=>x.Id == friendshipEntity.Id, cancellationToken);
        if(existingEntity==null)
            throw new ApplicationException("Friendship not found");
        _dbContext.Entry(existingEntity).CurrentValues.SetValues(friendshipEntity);
        _dbContext.Entry(existingEntity).Property(x=>x.CreatedAt).IsModified = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var ent = await _dbSet.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new ApplicationException("Entity not found");
        _dbSet.Remove(ent);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ChangeStatusAsync(Guid userId, Guid friendId, FriendshipStatus status, CancellationToken cancellationToken)
    {
        var friendship = await _dbSet.FirstOrDefaultAsync(
            el=>el.UserId == userId && el.FriendId == friendId,
            cancellationToken)?? throw new ApplicationException("Entity not found");
        friendship.Status = status;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task ChangeStatusAsync(Guid friendshipId, FriendshipStatus status, CancellationToken cancellationToken)
    {
        var friendship = await _dbSet.FindAsync([friendshipId], cancellationToken)
            ?? throw new ApplicationException("Entity not found");
        friendship.Status = status;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<FriendshipEntity> GetByIdAsync(Guid id, CancellationToken cancellationToken,
        Func<IQueryable<FriendshipEntity>, IQueryable<FriendshipEntity>>? include = null)
    {
        IQueryable<FriendshipEntity> query = _dbSet.Where(el => el.Id == id);
        if(include != null)
            query = include(query);
        var friendship = await query.FirstOrDefaultAsync(cancellationToken) ??
                          throw new ApplicationException("Entity not found");
        return friendship;
    }

    public async Task<FriendshipEntity?> GetFriendshipByUsernameAsync(Guid userId, string friendUsername, CancellationToken cancellationToken)
    {
        var friendship = await _dbSet.Where(el => el.UserId == userId)
            .Include(el => el.Friend)
            .FirstOrDefaultAsync(el => el.Friend != null && 
                                       el.Friend.Username == friendUsername, cancellationToken);
        return friendship;
    }

    public async Task<IEnumerable<FriendshipEntity>> SearchFriendshipsByUsernameAsync(
        Guid userId,
        string query,
        DateTime? lastCreatedAt,
        int pageSize,
        FriendshipStatus targetStatus,
        CancellationToken cancellationToken)
    {
        var q = _dbSet
            .Where(el => el.UserId == userId && el.Status == targetStatus)
            .Include(el => el.Friend)
            .AsQueryable();

        if (lastCreatedAt is not null)
            q = q.Where(el => el.CreatedAt < lastCreatedAt);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var lowered = query.ToLower();
            q = q.Where(el => el.Friend != null && 
                              EF.Functions.Like(el.Friend.Username.ToLower(),
                                  $"%{query}%"));
        }

        var friendships = await q
            .OrderByDescending(el => el.CreatedAt)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return friendships;
    }

    public async Task<IEnumerable<FriendshipEntity>> SearchIncomingFriendshipRequestsAsync(
        Guid userId,
        string query,
        DateTime? lastCreatedAt,
        int pageSize,
        FriendshipStatus targetStatus,
        CancellationToken cancellationToken)
    {
        var q = _dbSet
            .Where(el => el.FriendId == userId && el.Status == targetStatus)
            .Include(el => el.User)
            .AsQueryable();

        if (lastCreatedAt is not null)
            q = q.Where(el => el.CreatedAt < lastCreatedAt);

        if (!string.IsNullOrWhiteSpace(query))
        {
            var lowered = query.ToLower();
            q = q.Where(el => el.User != null && 
                              EF.Functions.Like(el.User.Username.ToLower(),
                                  $"%{query}%"));
        }

        var friendships = await q
            .OrderByDescending(el => el.CreatedAt)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return friendships;
    }
}