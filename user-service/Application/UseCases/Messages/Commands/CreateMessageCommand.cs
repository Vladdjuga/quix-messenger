using Application.Common;
using Application.DTOs;
using Application.DTOs.Message;
using Application.Events;
using Application.Interfaces;
using Application.Interfaces.Events;
using Application.Mappings;
using Domain.Entities;
using Domain.Enums;
using Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.UseCases.Messages.Commands;

public record CreateMessageCommand(
    string Text, 
    Guid UserId, 
    Guid ChatId,
    IEnumerable<FileStreamDto>? Files = null) 
    : IRequest<Result<ReadMessageDto>>;

public class CreateMessageHandler : IRequestHandler<CreateMessageCommand, Result<ReadMessageDto>>
{
    private readonly IMessageRepository _messageRepository;
    private readonly IMessageAttachmentRepository _attachmentRepository;
    private readonly IUserChatRepository _userChatRepository;
    private readonly IMessageAttachmentStorageService _storageService;
    private readonly IEventPublisher _eventPublisher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateMessageHandler> _logger;

    public CreateMessageHandler(
        IMessageRepository messageRepository,
        IMessageAttachmentRepository attachmentRepository,
        IUserChatRepository userChatRepository,
        IMessageAttachmentStorageService storageService,
        IEventPublisher eventPublisher,
        IUnitOfWork unitOfWork,
        ILogger<CreateMessageHandler> logger)
    {
        _messageRepository = messageRepository;
        _attachmentRepository = attachmentRepository;
        _userChatRepository = userChatRepository;
        _storageService = storageService;
        _eventPublisher = eventPublisher;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<ReadMessageDto>> Handle(
        CreateMessageCommand request, 
        CancellationToken cancellationToken)
    {
        // Validation
        if (request.ChatId == Guid.Empty || request.UserId == Guid.Empty)
            return Result<ReadMessageDto>.Failure("Invalid chat or user ID");

        var membership = await _userChatRepository.GetByUserAndChatAsync(
            request.UserId, request.ChatId, cancellationToken);
        if (membership is null)
            return Result<ReadMessageDto>.Failure("User is not a member of the chat");

        var uploadedFiles = new List<UploadedFileResult>();

        try
        {
            // Pre-generate message ID for file organization
            var messageId = Guid.NewGuid();
            
            // 1. Upload files FIRST (outside DB transaction for speed)
            if (request.Files?.Any() == true)
            {
                uploadedFiles = await _storageService.UploadMultipleAsync(
                    request.Files, 
                    request.ChatId, 
                    messageId, 
                    cancellationToken);

                _logger.LogInformation(
                    "Uploaded {Count} files for message {MessageId}",
                    uploadedFiles.Count, messageId);
            }

            // 2. Create message entity
            var message = new MessageEntity
            {
                Id = messageId,
                ChatId = request.ChatId,
                Text = request.Text ?? string.Empty,
                UserId = request.UserId,
                CreatedAt = DateTime.UtcNow,
                Status = MessageStatus.Sent | MessageStatus.Delivered
            };

            // 3. Save message to DB
            await _messageRepository.AddMessageAsync(message);

            // 4. Create and save attachment entities
            var attachmentEntities = uploadedFiles.Select(file => new MessageAttachmentEntity
            {
                Id = file.FileId,
                MessageId = message.Id,
                FileName = file.OriginalFileName,
                MimeType = file.ContentType,
                FileSize = file.Size,
                UploadedAt = DateTime.UtcNow,
                IsDeleted = false,
                FileUrl = file.StoragePath
            }).ToList();

            if (attachmentEntities.Any())
                await _attachmentRepository.AddRangeAsync(attachmentEntities, cancellationToken);

            // 5. Commit DB transaction
            //await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "User {UserId} created message {MessageId} in chat {ChatId} with {AttachmentCount} attachments",
                request.UserId, message.Id, request.ChatId, attachmentEntities.Count);

            // 6. Publish event (after successful commit)
            await _eventPublisher.PublishAsync(
                MessageMapper.MapToEvent(message, attachmentEntities), 
                cancellationToken);

            // 7. Return DTO
            return Result<ReadMessageDto>.Success(
                MessageMapper.MapToDto(message, attachmentEntities));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Failed to create message for user {UserId} in chat {ChatId}", 
                request.UserId, request.ChatId);

            // Cleanup uploaded files on failure
            if (uploadedFiles.Any())
            {
                await _storageService.DeleteMultipleAsync(
                    uploadedFiles.Select(f => f.StoragePath), 
                    cancellationToken);
            }

            return Result<ReadMessageDto>.Failure($"Failed to create message: {ex.Message}");
        }
    }
}

