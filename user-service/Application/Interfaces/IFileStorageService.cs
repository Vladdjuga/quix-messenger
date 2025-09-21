namespace Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(string filename,byte[] content, string folder,CancellationToken cancellationToken = default);
    Task<Stream> GetFileAsync(string path,CancellationToken cancellationToken = default);
}