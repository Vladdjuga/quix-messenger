namespace Domain.Entities;

public class MessageAttachmentEntity
{
    public Guid Id { get; init; }
    public required Guid MessageId { get; init; }
    public MessageEntity? Message { get; init; }
    public required string FileUrl { get; set; }
    public required string FileName { get; set; }
    public required long FileSize { get; set; }
    public required string MimeType { get; set; }
    public required DateTime UploadedAt { get; init; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
