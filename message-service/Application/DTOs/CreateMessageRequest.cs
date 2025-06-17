namespace Application.DTOs;

public class CreateMessageRequest
{
    public required string Text { get; set; }
    public required Guid UserId { get; set; }
    public required Guid ChatId { get; set; }
}