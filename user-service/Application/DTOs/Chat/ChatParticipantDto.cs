using Domain.Enums;

namespace Application.DTOs.Chat;

public class ChatParticipantDto
{
    public required Guid UserId { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required ChatRole ChatRole { get; init; }
    public string? AvatarUrl { get; init; }
}
