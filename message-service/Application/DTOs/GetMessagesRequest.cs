namespace Application.DTOs;

public class GetMessagesRequest
{
    public Guid? ChatId { get; set; }
    public Guid? UserId { get; set; }
    public int Count { get; set; }
}