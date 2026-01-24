using Application.DTOs;

namespace Application.Interfaces;

/// <summary>
/// File storage service for message attachments
/// </summary>
public interface IMessageAttachmentStorageService : IFileStorageService
{
    /// <summary>
    /// Upload multiple files efficiently
    /// </summary>
    /// <param name="files">Files to upload</param>
    /// <param name="chatId">Chat ID for organizing storage</param>
    /// <param name="messageId">Message ID for organizing storage</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of upload results with metadata</returns>
    Task<List<UploadedFileResult>> UploadMultipleAsync(
        IEnumerable<FileStreamDto> files,
        Guid chatId,
        Guid messageId,
        CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Delete multiple files
    /// </summary>
    /// <param name="storagePaths">Storage paths to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task DeleteMultipleAsync(
        IEnumerable<string> storagePaths,
        CancellationToken cancellationToken = default);
}

