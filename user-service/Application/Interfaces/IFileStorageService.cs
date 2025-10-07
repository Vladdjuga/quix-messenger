namespace Application.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Save file using byte array (legacy, for backward compatibility)
    /// </summary>
    Task<string> SaveFileAsync(string filename, byte[] content, string folder, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Save file using stream (efficient, recommended)
    /// </summary>
    Task<string> SaveFileAsync(string filename, Stream content, string folder, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get file as byte array (legacy, for backward compatibility)
    /// </summary>
    Task<byte[]> GetFileAsync(string path, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get file as stream (efficient, recommended)
    /// </summary>
    Task<Stream> GetFileStreamAsync(string path, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Delete a file
    /// </summary>
    Task DeleteFileAsync(string path, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Check if file exists
    /// </summary>
    Task<bool> FileExistsAsync(string path, CancellationToken cancellationToken = default);
}
