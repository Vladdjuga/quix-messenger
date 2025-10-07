namespace Application.DTOs;

/// <summary>
/// DTO for file operations using streams (memory-efficient)
/// </summary>
public class FileStreamDto : IDisposable, IAsyncDisposable
{
    public required string Name { get; set; }
    public required string ContentType { get; set; }
    public required Stream Content { get; set; }
    public long? ContentLength { get; set; }

    public void Dispose()
    {
        Content?.Dispose();
    }

    public async ValueTask DisposeAsync()
    {
        if (Content is not null)
        {
            await Content.DisposeAsync();
        }
    }
}
