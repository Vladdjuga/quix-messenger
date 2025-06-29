using Domain.Entities;

namespace Domain.Repositories;

public interface IUserSessionRepository
{
    Task<UserSessionEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<UserSessionEntity?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task AddAsync(UserSessionEntity userSession, CancellationToken cancellationToken);
    Task UpdateAsync(UserSessionEntity userSession, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task DeleteByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<IEnumerable<UserSessionEntity>> GetValidSessionsAsync(Guid userId, CancellationToken cancellationToken);
}