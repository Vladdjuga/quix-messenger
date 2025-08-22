using System.Linq.Expressions;
using Domain.Entities;
using Domain.Enums;

namespace Domain.Repositories;

public interface IUserContactRepository
{
    Task<IEnumerable<UserContactEntity>> GetAllUsersContactsAsync(Guid id,
        DateTime? lastCreatedAt, int pageSize,
        CancellationToken cancellationToken);
    Task<UserContactEntity?> GetUserContactAsync(Guid userId, Guid contactId,
        CancellationToken cancellationToken);
    Task<UserContactEntity?> GetUserContactAsync(Guid userId, Guid contactId,
        CancellationToken cancellationToken,
        Func<IQueryable<UserContactEntity>, IQueryable<UserContactEntity>>? include);
    Task AddAsync(UserContactEntity userContactEntity, CancellationToken cancellationToken);
    Task UpdateAsync(UserContactEntity userContactEntity, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task ChangeStatusAsync(Guid userId,Guid contactId, ContactStatus status,
        CancellationToken cancellationToken);
    Task ChangeStatusAsync(Guid userContactId, ContactStatus status,
        CancellationToken cancellationToken);
    Task<UserContactEntity> GetByIdAsync(Guid id, CancellationToken cancellationToken,
        Func<IQueryable<UserContactEntity>, IQueryable<UserContactEntity>>? include = null);
    Task<UserContactEntity?> GetUserContactByUsernameAsync(Guid userId,
        string contactUsername, CancellationToken cancellationToken);
    Task<IEnumerable<UserContactEntity>> SearchContactsByUsernameAsync(
        Guid userId,
        string query,
        DateTime? lastCreatedAt,
        int pageSize,
        ContactStatus targetStatus,
        CancellationToken cancellationToken);
    
    Task<IEnumerable<UserContactEntity>> SearchIncomingContactRequestsAsync(
        Guid userId,
        string query,
        DateTime? lastCreatedAt,
        int pageSize,
        ContactStatus targetStatus,
        CancellationToken cancellationToken);
}