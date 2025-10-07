namespace Application.DTOs.Message;


// DTO for message attachments
// Only contains metadata and a URL to access the file
public class MessageAttachmentDto
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string ContentType { get; set; }
    public required long Size { get; set; }
    public required string Url { get; set; }
}