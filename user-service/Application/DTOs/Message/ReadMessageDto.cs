using Domain.Enums;

namespace Application.DTOs.Message;

public class ReadMessageDto
{
    public Guid Id { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime ReceivedAt { get; set; }
    public required string Text { get; set; }
    public required Guid UserId { get; set; }
    public required Guid ChatId { get; set; }
    public required MessageStatus Status { get; set; }
}
