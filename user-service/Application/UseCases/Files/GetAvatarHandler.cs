using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Files;

public class GetAvatarHandler : IRequestHandler<GetAvatarQuery, Result<FileStreamDto>>
{
    private readonly IUserRepository _userRepository;
    private readonly IAvatarStorageService _avatarStorage;
    private readonly IUserDefaults _userDefaults;

    public GetAvatarHandler(IUserRepository userRepository, IAvatarStorageService avatarStorage, IUserDefaults userDefaults)
    {
        _userRepository = userRepository;
        _avatarStorage = avatarStorage;
        _userDefaults = userDefaults;
    }

    public async Task<Result<FileStreamDto>> Handle(GetAvatarQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            return Result<FileStreamDto>.Failure("User not found");

        var path = user.AvatarUrl?.TrimStart('/') ?? string.Empty;
        if (string.IsNullOrWhiteSpace(path))
            return Result<FileStreamDto>.Failure("Avatar not set");

        try
        {
            var stream= await _avatarStorage.GetFileStreamAsync(path, cancellationToken);

            var ext = Path.GetExtension(path).ToLowerInvariant();
            var contentType = _userDefaults.AvatarContentTypes.GetValueOrDefault(ext, "application/octet-stream");
            var file = new FileStreamDto
            {
                Name = Path.GetFileName(path),
                ContentType = contentType,
                Content = stream
            };

            return Result<FileStreamDto>.Success(file);
        }
        catch (Exception ex)
        {
            return Result<FileStreamDto>.Failure($"Failed to read avatar: {ex.Message}");
        }
    }
}
