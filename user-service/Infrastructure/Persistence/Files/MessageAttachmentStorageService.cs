using Application.DTOs;
using Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence.Files;

public class MessageAttachmentStorageService : PhysicalFileStorageService, IMessageAttachmentStorageService
{
    private readonly ILogger<MessageAttachmentStorageService> _logger;

    public MessageAttachmentStorageService(
        string webRoot, 
        string baseFolder,
        ILogger<MessageAttachmentStorageService> logger) : base(webRoot, baseFolder)
    {
        _logger = logger;
    }

    public async Task<List<UploadedFileResult>> UploadMultipleAsync(
        IEnumerable<FileStreamDto> files,
        Guid chatId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        var results = new List<UploadedFileResult>();
        var folder = $"{chatId}/{messageId}";

        foreach (var file in files.Where(f => f.Content.Length > 0))
        {
            try
            {
                var fileId = Guid.NewGuid();
                var uniqueFileName = $"{fileId}_{file.Name}";
                var fileSize = file.Content.Length;

                await SaveFileAsync(uniqueFileName, file.Content, folder, cancellationToken);

                results.Add(new UploadedFileResult
                {
                    FileId = fileId,
                    FileName = uniqueFileName,
                    OriginalFileName = file.Name,
                    ContentType = file.ContentType,
                    Size = fileSize,
                    StoragePath = $"{folder}/{uniqueFileName}"
                });

                _logger.LogInformation(
                    "Uploaded file {FileName} ({Size} bytes) for message {MessageId}",
                    file.Name, fileSize, messageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to upload file {FileName} for message {MessageId}",
                    file.Name, messageId);
                // Continue with other files
            }
        }

        return results;
    }

    public async Task DeleteMultipleAsync(
        IEnumerable<string> storagePaths,
        CancellationToken cancellationToken = default)
    {
        foreach (var path in storagePaths)
        {
            try
            {
                await DeleteFileAsync(path, cancellationToken);
                _logger.LogInformation("Deleted file at path {Path}", path);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete file at path {Path}", path);
                // Continue with other files
            }
        }
    }
}

