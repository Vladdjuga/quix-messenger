namespace Application.DTOs.Chat;

public class RemoveUserFromChatDto
{
    public required Guid ChatId { get; set; }
    public required Guid UserId { get; set; }
}
