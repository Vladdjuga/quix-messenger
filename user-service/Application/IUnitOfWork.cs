namespace Application;

public interface IUnitOfWork:IDisposable
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    //Task BeginTransactionAsync();
    //Task CommitTransactionAsync();
    //Task RollbackTransactionAsync();
}
