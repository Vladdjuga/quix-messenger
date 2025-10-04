using Application.Common;
using Application.Interfaces;
using Domain.Enums;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Chats.UploadChatAvatar;

public class UploadChatAvatarHandler : IRequestHandler<UploadChatAvatarCommand, Result<string>>
{
    private readonly IAvatarStorageService _fileService;
    private readonly IUserDefaults _userDefaults;
    private readonly IChatRepository _chatRepository;
    private readonly IUserChatRepository _userChatRepository;

    public UploadChatAvatarHandler(
        IAvatarStorageService fileService,
        IUserDefaults userDefaults,
        IChatRepository chatRepository,
        IUserChatRepository userChatRepository)
    {
        _fileService = fileService;
        _userDefaults = userDefaults;
        _chatRepository = chatRepository;
        _userChatRepository = userChatRepository;
    }

    public async Task<Result<string>> Handle(UploadChatAvatarCommand request, CancellationToken cancellationToken)
    {
        if (request.File.Content.Length == 0)
            return Result<string>.Failure("File is empty");

        var chat = await _chatRepository.GetByIdAsync(request.ChatId, cancellationToken);
        if (chat is null)
            return Result<string>.Failure("Chat not found");

        // Only Group chats can have avatars
        if (chat.ChatType != ChatType.Group)
            return Result<string>.Failure("Only group chats can have avatars");

        // Check if initiator is in the chat and has permission
        var initiatorUserChat = await _userChatRepository.GetByUserAndChatAsync(
            request.InitiatorUserId, request.ChatId, cancellationToken);

        if (initiatorUserChat is null)
            return Result<string>.Failure("You are not a member of this chat");

        // Only Admins and Moderators can upload chat avatar
        if (initiatorUserChat.ChatRole > ChatRole.Moderator)
            return Result<string>.Failure("Insufficient permissions to upload chat avatar");

        var fileExtension = Path.GetExtension(request.File.Name).ToLowerInvariant();
        if (string.IsNullOrEmpty(fileExtension) || !_userDefaults.AllowedAvatarFileExtensions.Contains(fileExtension))
            return Result<string>.Failure("Unsupported file type");

        var newFileName = $"chat_{request.ChatId}{fileExtension}";

        if (request.File.Content.Length > _userDefaults.MaxAvatarSizeInBytes)
            return Result<string>.Failure($"File size exceeds the limit of {_userDefaults.MaxAvatarSizeInBytes} bytes.");

        try
        {
            var fileUrl = await _fileService.SaveFileAsync(
                newFileName,
                request.File.Content,
                "chats",
                cancellationToken);

            chat.AvatarUrl = Path.Combine("chats", fileUrl);
            await _chatRepository.UpdateAsync(chat, cancellationToken);

            return Result<string>.Success(fileUrl);
        }
        catch (Exception ex)
        {
            return Result<string>.Failure($"File upload failed: {ex.Message}");
        }
    }
}
