namespace Domain.Entities;

public class UserSessionEntity
{
    public Guid Id { get; set; }
    public required Guid UserId { get; set; }
    public virtual UserEntity? User { get; set; }
    public required string HashedToken { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public required bool IsActive { get; set; }
}