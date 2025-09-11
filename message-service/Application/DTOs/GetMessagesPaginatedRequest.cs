namespace Application.DTOs;

public class GetMessagesPaginatedRequest
{
    public Guid ChatId { get; set; }
    public DateTime LastCreatedAt { get; set; }
    public int PageSize { get; set; }
}