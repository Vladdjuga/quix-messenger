namespace Application.DTOs.User;

public class ReadUserDto
{
    public required Guid Id { get; set; }
    public required string AvatarUrl { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required DateTime DateOfBirth { get; set; }
    public required DateTime CreatedAt { get; set; }
    // Relationship to current (requesting) user, if available in context
    public RelationshipStatusDto RelationshipStatus { get; set; } = RelationshipStatusDto.None;
    public Guid? FriendshipId { get; set; }
    public Guid? PrivateChatId { get; set; }
}