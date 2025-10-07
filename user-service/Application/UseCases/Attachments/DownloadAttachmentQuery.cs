using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.UseCases.Attachments;

public record DownloadAttachmentQuery(Guid AttachmentId, Guid UserId) : IRequest<Result<FileStreamDto>>;

public class DownloadAttachmentHandler : IRequestHandler<DownloadAttachmentQuery, Result<FileStreamDto>>
{
    private readonly IMessageAttachmentRepository _attachmentRepository;
    private readonly IMessageAttachmentStorageService _storageService;
    private readonly IUserChatRepository _userChatRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly ILogger<DownloadAttachmentHandler> _logger;

    public DownloadAttachmentHandler(
        IMessageAttachmentRepository attachmentRepository,
        IMessageAttachmentStorageService storageService,
        IUserChatRepository userChatRepository,
        IMessageRepository messageRepository,
        ILogger<DownloadAttachmentHandler> logger)
    {
        _attachmentRepository = attachmentRepository;
        _storageService = storageService;
        _userChatRepository = userChatRepository;
        _messageRepository = messageRepository;
        _logger = logger;
    }

    public async Task<Result<FileStreamDto>> Handle(DownloadAttachmentQuery request, CancellationToken cancellationToken)
    {
        // Get attachment metadata
        var attachment = await _attachmentRepository.GetByIdAsync(request.AttachmentId, cancellationToken);
        if (attachment == null)
        {
            _logger.LogWarning("Attachment {AttachmentId} not found", request.AttachmentId);
            return Result<FileStreamDto>.Failure("Attachment not found.");
        }

        if (attachment.IsDeleted)
        {
            _logger.LogWarning("Attempted to download deleted attachment {AttachmentId}", request.AttachmentId);
            return Result<FileStreamDto>.Failure("Attachment has been deleted.");
        }

        // Get message to find chat
        var message = await _messageRepository.GetByIdAsync(attachment.MessageId, cancellationToken);
        if (message == null)
        {
            _logger.LogWarning("Message {MessageId} not found for attachment {AttachmentId}", 
                attachment.MessageId, request.AttachmentId);
            return Result<FileStreamDto>.Failure("Message not found.");
        }

        // Verify user has access to the chat
        var userChat = await _userChatRepository.GetByUserAndChatAsync(request.UserId, message.ChatId, cancellationToken);
        if (userChat == null)
        {
            _logger.LogWarning("User {UserId} attempted to download attachment {AttachmentId} from chat {ChatId} they don't have access to", 
                request.UserId, request.AttachmentId, message.ChatId);
            return Result<FileStreamDto>.Failure("You don't have access to this attachment.");
        }

        // Get file stream
        try
        {
            var fileStream = await _storageService.GetFileStreamAsync(attachment.FileUrl, cancellationToken);
            
            var fileStreamDto = new FileStreamDto
            {
                Name = attachment.FileName,
                ContentType = attachment.MimeType,
                Content = fileStream,
                ContentLength = attachment.FileSize
            };

            _logger.LogInformation("User {UserId} downloading attachment {AttachmentId} ({FileName})", 
                request.UserId, request.AttachmentId, attachment.FileName);

            return Result<FileStreamDto>.Success(fileStreamDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve file stream for attachment {AttachmentId}", request.AttachmentId);
            return Result<FileStreamDto>.Failure("Failed to retrieve attachment file.");
        }
    }
}
