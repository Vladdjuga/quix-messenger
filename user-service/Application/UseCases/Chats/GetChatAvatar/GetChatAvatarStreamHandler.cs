using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Chats.GetChatAvatar;

public class GetChatAvatarStreamHandler : IRequestHandler<GetChatAvatarStreamQuery, Result<FileStreamDto?>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IAvatarStorageService _avatarStorage;
    private readonly IUserDefaults _userDefaults;

    public GetChatAvatarStreamHandler(
        IChatRepository chatRepository,
        IAvatarStorageService avatarStorage,
        IUserDefaults userDefaults)
    {
        _chatRepository = chatRepository;
        _avatarStorage = avatarStorage;
        _userDefaults = userDefaults;
    }

    public async Task<Result<FileStreamDto?>> Handle(GetChatAvatarStreamQuery request, CancellationToken cancellationToken)
    {
        var chat = await _chatRepository.GetByIdAsync(request.ChatId, cancellationToken);
        if (chat is null)
            return Result<FileStreamDto?>.Failure("Chat not found");
        
        if (chat.AvatarUrl is null)
            return Result<FileStreamDto?>.Success(null); // No avatar set. It's a valid case.
        
        var path = chat.AvatarUrl.TrimStart('/');
        
        try
        {
            // Check if file exists before opening stream
            var exists = await _avatarStorage.FileExistsAsync(path, cancellationToken);
            if (!exists)
                return Result<FileStreamDto?>.Failure("Avatar file not found");

            // Get file stream - no memory allocation for file content
            var stream = await _avatarStorage.GetFileStreamAsync(path, cancellationToken);

            var ext = Path.GetExtension(path).ToLowerInvariant();
            var contentType = _userDefaults.AvatarContentTypes.GetValueOrDefault(ext, "application/octet-stream");
            
            var file = new FileStreamDto
            {
                Name = Path.GetFileName(path),
                ContentType = contentType,
                Content = stream,
                ContentLength = stream.CanSeek ? stream.Length : null
            };

            return Result<FileStreamDto?>.Success(file);
        }
        catch (Exception ex)
        {
            return Result<FileStreamDto?>.Failure($"Failed to read chat avatar: {ex.Message}");
        }
    }
}
