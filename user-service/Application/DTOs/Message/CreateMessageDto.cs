namespace Application.DTOs.Message;

public class CreateMessageDto
{
    public required string Text { get; set; }
    public required Guid ChatId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
