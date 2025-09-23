using Domain.Enums;

namespace Application.DTOs.Friendship;

public class ReadFriendshipDto
{
    public required Guid Id { get; set; }
    public required Guid UserId { get; set; }
    public required string AvatarUrl { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required DateTime DateOfBirth { get; set; }
    public required FriendshipStatus Status { get; set; }
    public Guid? PrivateChatId { get; init; }
    public required DateTime CreatedAt { get; init; }
}