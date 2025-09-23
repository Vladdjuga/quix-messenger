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

    public async Task<string> SaveFileAsync(string filename, byte[] content,
        string? folder,CancellationToken cancellationToken = default)
    {
        folder ??= _baseFolder;
        var path = Path.Combine(_webRoot, folder, filename);
        var dir = Path.GetDirectoryName(path);
        if (dir is not null && !Directory.Exists(dir))
            Directory.CreateDirectory(dir);
        await File.WriteAllBytesAsync(path, content, cancellationToken);
        
        return filename;
    }

    public async Task<Stream> GetFileAsync(string path,CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_webRoot, path);
        var memory = new MemoryStream();
        await using (var stream = new FileStream(fullPath, FileMode.Open))
        {
            await stream.CopyToAsync(memory, cancellationToken);
        }
        memory.Position = 0;
        return memory;
    }
}