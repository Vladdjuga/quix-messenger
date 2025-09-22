using Application.Common;
using Application.Interfaces;
using Domain.Repositories;
using MediatR;

namespace Application.UseCases.Files;

public class UploadAvatarHandler: IRequestHandler<UploadAvatarCommand, Result<string>>
{
    private readonly IAvatarStorageService _fileService;
    private readonly IUserDefaults _userDefaults;
    private readonly IUserRepository _userRepository;

    public UploadAvatarHandler(IAvatarStorageService fileService, IUserDefaults userDefaults, IUserRepository userRepository)
    {
        _fileService = fileService;
        _userDefaults = userDefaults;
        _userRepository = userRepository;
    }

    public async Task<Result<string>> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        if (request.File.Content.Length == 0)
            return Result<string>.Failure("File is empty");
        
        var fileExtension = Path.GetExtension(request.File.Name).ToLowerInvariant();
        if (string.IsNullOrEmpty(fileExtension) || !_userDefaults.AllowedAvatarFileExtensions.Contains(fileExtension))
            return Result<string>.Failure("Unsupported file type");
        
        var newFileName = $"{request.UserId}{fileExtension}";

        if (request.File.Content.Length > _userDefaults.MaxAvatarSizeInBytes) 
            return Result<string>.Failure($"File size exceeds the limit of {_userDefaults.MaxAvatarSizeInBytes} bytes.");
        try
        {
            var fileUrl = await _fileService.SaveFileAsync(
                newFileName,
                request.File.Content,
                null!,
                cancellationToken);
            
            var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
            if (user is null)
                return Result<string>.Failure("User not found");
            user.AvatarUrl = fileUrl;
            await _userRepository.UpdateAsync(user, cancellationToken);
            
            return Result<string>.Success(fileUrl);
        }
        catch (Exception ex)
        {
            // Log the exception (not implemented here)
            return Result<string>.Failure($"File upload failed: {ex.Message}");
        }
    }
}