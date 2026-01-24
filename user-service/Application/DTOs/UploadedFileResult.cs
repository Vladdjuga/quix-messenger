namespace Application.DTOs;

/// <summary>
/// Result of a file upload operation
/// </summary>
public class UploadedFileResult
{
    public required Guid FileId { get; init; }
    public required string FileName { get; init; }
    public required string OriginalFileName { get; init; }
    public required string ContentType { get; init; }
    public required long Size { get; init; }
    public required string StoragePath { get; init; }
}
