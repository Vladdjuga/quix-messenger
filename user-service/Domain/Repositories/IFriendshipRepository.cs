using System.Linq.Expressions;
using Domain.Entities;
using Domain.Enums;

namespace Domain.Repositories;

public interface IFriendshipRepository
{
    Task<IEnumerable<FriendshipEntity>> GetAllUsersFriendshipsAsync(Guid id,
        DateTime? lastCreatedAt, int pageSize,
        CancellationToken cancellationToken);
    Task<FriendshipEntity?> GetFriendshipAsync(Guid userId, Guid friendId,
        CancellationToken cancellationToken);
    Task<FriendshipEntity?> GetFriendshipAsync(Guid userId, Guid friendId,
        CancellationToken cancellationToken,
        Func<IQueryable<FriendshipEntity>, IQueryable<FriendshipEntity>>? include);
    Task AddAsync(FriendshipEntity friendshipEntity, CancellationToken cancellationToken);
    Task UpdateAsync(FriendshipEntity friendshipEntity, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task ChangeStatusAsync(Guid userId,Guid friendId, FriendshipStatus status,
        CancellationToken cancellationToken);
    Task ChangeStatusAsync(Guid friendshipId, FriendshipStatus status,
        CancellationToken cancellationToken);
    Task<FriendshipEntity> GetByIdAsync(Guid id, CancellationToken cancellationToken,
        Func<IQueryable<FriendshipEntity>, IQueryable<FriendshipEntity>>? include = null);
    Task<FriendshipEntity?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken);
    Task<FriendshipEntity?> GetFriendshipByUsernameAsync(Guid userId,
        string friendUsername, CancellationToken cancellationToken);
    Task<IEnumerable<FriendshipEntity>> SearchFriendshipsByUsernameAsync(
        Guid userId,
        string query,
        DateTime? lastCreatedAt,
        int pageSize,
        FriendshipStatus targetStatus,
        CancellationToken cancellationToken);
    
    Task<IEnumerable<FriendshipEntity>> SearchIncomingFriendshipRequestsAsync(
        Guid userId,
        string query,
        DateTime? lastCreatedAt,
        int pageSize,
        FriendshipStatus targetStatus,
        CancellationToken cancellationToken);
    
    Task<IEnumerable<FriendshipEntity>> SearchOutgoingFriendshipRequestsAsync(
        Guid userId,
        string query,
        DateTime? lastCreatedAt,
        int pageSize,
        FriendshipStatus targetStatus,
        CancellationToken cancellationToken);
    Task<IEnumerable<FriendshipEntity>> GetFriendshipsWithUsersAsync(
        Guid userId,
        IEnumerable<Guid> otherUserIds,
        CancellationToken cancellationToken);
}