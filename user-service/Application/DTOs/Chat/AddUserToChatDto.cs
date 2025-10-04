using Domain.Enums;

namespace Application.DTOs.Chat;

public class AddUserToChatDto
{
    public required Guid ChatId { get; set; }
    public required Guid UserId { get; set; }
    public required ChatRole ChatRole { get; set; }
}