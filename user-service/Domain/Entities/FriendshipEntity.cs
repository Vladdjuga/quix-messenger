using Domain.Enums;

namespace Domain.Entities;

public class FriendshipEntity
{
    public Guid Id { get; init; }
    
    public required Guid UserId { get; init; }
    public UserEntity? User { get; init; }
    
    public required Guid FriendId { get; init; }
    public UserEntity? Friend { get; init; }
    
    public required FriendshipStatus Status { get; set; }
    public required DateTime CreatedAt { get; init; }
    
    public Guid? PrivateChatId { get; set; }
    public ChatEntity? PrivateChat { get; init; }
}