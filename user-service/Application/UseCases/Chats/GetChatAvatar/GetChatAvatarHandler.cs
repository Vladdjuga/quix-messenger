using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Chats.GetChatAvatar;

public class GetChatAvatarHandler : IRequestHandler<GetChatAvatarQuery, Result<FileDto?>>
{
    private readonly IChatRepository _chatRepository;
    private readonly IAvatarStorageService _avatarStorage;
    private readonly IUserDefaults _userDefaults;

    public GetChatAvatarHandler(
        IChatRepository chatRepository,
        IAvatarStorageService avatarStorage,
        IUserDefaults userDefaults)
    {
        _chatRepository = chatRepository;
        _avatarStorage = avatarStorage;
        _userDefaults = userDefaults;
    }

    public async Task<Result<FileDto?>> Handle(GetChatAvatarQuery request, CancellationToken cancellationToken)
    {
        var chat = await _chatRepository.GetByIdAsync(request.ChatId, cancellationToken);
        if (chat is null)
            return Result<FileDto?>.Failure("Chat not found");
        
        if (chat.AvatarUrl is null)
            return Result<FileDto?>.Success(null); // No avatar set. It's a valid case.
        
        var path = chat.AvatarUrl.TrimStart('/');
        try
        {
            await using var stream = await _avatarStorage.GetFileAsync(path, cancellationToken);
            await using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            var bytes = ms.ToArray();

            var ext = Path.GetExtension(path).ToLowerInvariant();
            var contentType = _userDefaults.AvatarContentTypes.GetValueOrDefault(ext, "application/octet-stream");
            var file = new FileDto
            {
                Name = Path.GetFileName(path),
                ContentType = contentType,
                Content = bytes
            };

            return Result<FileDto?>.Success(file);
        }
        catch (Exception ex)
        {
            return Result<FileDto?>.Failure($"Failed to read chat avatar: {ex.Message}");
        }
    }
}
