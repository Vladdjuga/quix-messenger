namespace Application;

// Note: This interface and its implementations are not used in the current codebase.
public interface IUnitOfWork:IDisposable
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    //Task BeginTransactionAsync();
    //Task CommitTransactionAsync();
    //Task RollbackTransactionAsync();
}
