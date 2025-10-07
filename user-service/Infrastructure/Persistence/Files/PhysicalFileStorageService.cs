using Application.Interfaces;

namespace Infrastructure.Persistence.Files;

public class PhysicalFileStorageService: IFileStorageService
{
    private readonly string _webRoot;
    private readonly string _baseFolder;

    public PhysicalFileStorageService(string webRoot, string baseFolder)
    {
        _webRoot = webRoot;
        _baseFolder = baseFolder;
    }

    /// <summary>
    /// Save file using byte array (legacy method)
    /// </summary>
    public async Task<string> SaveFileAsync(string filename, byte[] content,
        string? folder, CancellationToken cancellationToken = default)
    {
        folder ??= _baseFolder;
        var path = Path.Combine(_webRoot, folder, filename);
        var dir = Path.GetDirectoryName(path);
        if (dir is not null && !Directory.Exists(dir))
            Directory.CreateDirectory(dir);
        await File.WriteAllBytesAsync(path, content, cancellationToken);
        
        return filename;
    }

    /// <summary>
    /// Save file using stream (efficient, recommended)
    /// </summary>
    public async Task<string> SaveFileAsync(string filename, Stream content,
        string? folder, CancellationToken cancellationToken = default)
    {
        folder ??= _baseFolder;
        var path = Path.Combine(_webRoot, folder, filename);
        var dir = Path.GetDirectoryName(path);
        if (dir is not null && !Directory.Exists(dir))
            Directory.CreateDirectory(dir);
        
        await using var fileStream = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.None, 
            bufferSize: 81920, useAsync: true);
        await content.CopyToAsync(fileStream, cancellationToken);
        
        return filename;
    }

    /// <summary>
    /// Get file as byte array (legacy method - loads entire file to memory)
    /// </summary>
    public async Task<byte[]> GetFileAsync(string path, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_webRoot, path);
        return await File.ReadAllBytesAsync(fullPath, cancellationToken);
    }

    /// <summary>
    /// Get file as stream (efficient - streams data without loading to memory)
    /// </summary>
    public Task<Stream> GetFileStreamAsync(string path, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_webRoot, path);
        
        // FileStream with async support and optimal buffer size
        var stream = new FileStream(
            fullPath, 
            FileMode.Open, 
            FileAccess.Read, 
            FileShare.Read, 
            bufferSize: 81920, // 80KB buffer for optimal I/O
            useAsync: true);
        
        return Task.FromResult<Stream>(stream);
    }

    /// <summary>
    /// Delete a file
    /// </summary>
    public Task DeleteFileAsync(string path, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_webRoot, path);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        return Task.CompletedTask;
    }

    /// <summary>
    /// Check if file exists
    /// </summary>
    public Task<bool> FileExistsAsync(string path, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_webRoot, path);
        return Task.FromResult(File.Exists(fullPath));
    }
}
