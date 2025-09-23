using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Files;

public class GetAvatarHandler : IRequestHandler<GetAvatarQuery, Result<FileDto>>
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

    public async Task<Result<FileDto>> Handle(GetAvatarQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
            return Result<FileDto>.Failure("User not found");

        var path = user.AvatarUrl?.TrimStart('/') ?? string.Empty;
        if (string.IsNullOrWhiteSpace(path))
            return Result<FileDto>.Failure("Avatar not set");

        try
        {
            await using var stream = await _avatarStorage.GetFileAsync(path, cancellationToken);
            await using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            var bytes = ms.ToArray();

            var ext = Path.GetExtension(path).ToLowerInvariant();
            var contentType = _userDefaults.AvatarContentTypes.TryGetValue(ext, out var ct)
                ? ct
                : "application/octet-stream";

            var file = new FileDto
            {
                Name = Path.GetFileName(path),
                ContentType = contentType,
                Content = bytes
            };

            return Result<FileDto>.Success(file);
        }
        catch (Exception ex)
        {
            return Result<FileDto>.Failure($"Failed to read avatar: {ex.Message}");
        }
    }
}
