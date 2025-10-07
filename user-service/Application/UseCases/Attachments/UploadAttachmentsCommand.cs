using Application.Common;
using Application.DTOs;
using Application.DTOs.Message;
using Application.Interfaces;
using Domain.Entities;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.UseCases.Attachments;

public record UploadAttachmentsCommand(Guid MessageId, Guid ChatId, List<FileStreamDto> Files) : IRequest<Result<List<MessageAttachmentDto>>>;

public class UploadAttachmentsHandler : IRequestHandler<UploadAttachmentsCommand, Result<List<MessageAttachmentDto>>>
{
    private readonly IMessageAttachmentStorageService _storageService;
    private readonly IMessageAttachmentRepository _attachmentRepository;
    private readonly ILogger _logger;

    public UploadAttachmentsHandler(IMessageAttachmentStorageService storageService,
        IMessageAttachmentRepository attachmentRepository, ILogger<UploadAttachmentsHandler> logger)
    {
        _storageService = storageService;
        _attachmentRepository = attachmentRepository;
        _logger = logger;
    }

    public async Task<Result<List<MessageAttachmentDto>>> Handle(UploadAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var uploadResults = new List<(FileStreamDto file, string savedFileName, long fileSize)>();

        foreach (var file in request.Files.Where(f => f.Content.Length > 0))
        {
            var uniqueFileName = $"{Guid.NewGuid()}_{file.Name}";
            var folder = $"{request.ChatId}/{request.MessageId}";

            try
            {
                var fileSize = file.Content.Length;
                await _storageService.SaveFileAsync(uniqueFileName, file.Content, folder, cancellationToken);
                uploadResults.Add((file, uniqueFileName, fileSize));
                
                _logger.LogInformation("Successfully uploaded file {FileName} (size: {FileSize} bytes) for message {MessageId}", 
                    file.Name, fileSize, request.MessageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file {FileName} for message {MessageId} in chat {ChatId}", 
                    file.Name, request.MessageId, request.ChatId);
            }
        }
        
        if (uploadResults.Count == 0)
            return Result<List<MessageAttachmentDto>>.Failure("No files were uploaded successfully.");
        
        // Create attachment entities
        var attachmentEntities = uploadResults.Select(result => new MessageAttachmentEntity
        {
            Id = Guid.NewGuid(),
            MessageId = request.MessageId,
            FileName = result.file.Name,
            MimeType = result.file.ContentType,
            FileSize = result.fileSize,
            UploadedAt = DateTime.UtcNow,
            IsDeleted = false,
            FileUrl = $"{request.ChatId}/{request.MessageId}/{result.savedFileName}"
        }).ToList();

        await _attachmentRepository.AddRangeAsync(attachmentEntities, cancellationToken);

        // Map to DTOs
        var attachmentDtos = attachmentEntities.Select(entity => new MessageAttachmentDto
        {
            Id = entity.Id,
            Name = entity.FileName,
            ContentType = entity.MimeType,
            Size = entity.FileSize,
            Url = $"/api/Attachment/download/{entity.Id}"
        }).ToList();

        _logger.LogInformation("Successfully uploaded {Count} attachments for message {MessageId} in chat {ChatId}", 
            attachmentDtos.Count, request.MessageId, request.ChatId);

        return Result<List<MessageAttachmentDto>>.Success(attachmentDtos);
    }
}