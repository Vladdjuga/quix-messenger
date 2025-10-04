namespace Application.DTOs.Chat;

public class UpdateChatDto
{
    public required Guid ChatId { get; set; }
    public required string Title { get; set; }
}
