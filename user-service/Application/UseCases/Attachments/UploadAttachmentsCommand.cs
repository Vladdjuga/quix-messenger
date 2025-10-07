using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.UseCases.Attachments;

public record UploadAttachmentsCommand(Guid MessageId,Guid ChatId, List<FileStreamDto> Files) : IRequest<Result<List<FileStreamDto>>>;

public class UploadAttachmentsHandler : IRequestHandler<UploadAttachmentsCommand, Result<List<FileStreamDto>>>
{
    private readonly IMessageAttachmentStorageService _storageService;
    private readonly IMessageAttachmentRepository _attachmentRepository;
    private readonly ILogger _logger;

    public UploadAttachmentsHandler(IMessageAttachmentStorageService storageService,
        IMessageAttachmentRepository attachmentRepository, ILogger logger)
    {
        _storageService = storageService;
        _attachmentRepository = attachmentRepository;
        _logger = logger;
    }

    public async Task<Result<List<FileStreamDto>>> Handle(UploadAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var uploadedFiles = (await Task.WhenAll(request.Files.Select(async file =>
        {
            var filename = $"{Guid.NewGuid()}_{file.Name}";
            var folder = $"attachments/{request.ChatId}/{request.MessageId}/";

            try
            {
                await _storageService.SaveFileAsync(filename, file.Content, folder, cancellationToken);
                return file;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file {FileName} for message {MessageId} in chat {ChatId}", 
                    file.Name, request.MessageId, request.ChatId);
                return null;
            }
        }))).OfType<FileStreamDto>().ToList();
        
        if (uploadedFiles.Count == 0)
            return Result<List<FileStreamDto>>.Failure("No files were uploaded successfully.");
        
        var attachmentEntities = uploadedFiles.Select(file => new MessageAttachmentEntity
        {
            Id = Guid.NewGuid(),
            MessageId = request.MessageId,
            FileName = file.Name,
            MimeType = file.ContentType,
            FileSize = file.Content.Length,
            UploadedAt = DateTime.UtcNow,
            IsDeleted = false,
            FileUrl = $"attachments/{request.ChatId}/{request.MessageId}/{file.Name}" // Example URL pattern
        }).ToList();

        await _attachmentRepository.AddRangeAsync(attachmentEntities, cancellationToken);

        return Result<List<FileStreamDto>>.Success(uploadedFiles);
    }
}