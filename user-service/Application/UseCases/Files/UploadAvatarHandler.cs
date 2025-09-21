using Application.Common;
using Application.Interfaces;
using MediatR;

namespace Application.UseCases.Files;

public class UploadAvatarHandler: IRequestHandler<UploadAvatarCommand, Result<string>>
{
    private readonly IAvatarStorageService _fileService;

    public UploadAvatarHandler(IAvatarStorageService fileService)
    {
        _fileService = fileService;
    }

    public async Task<Result<string>> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        if (request.File.Content.Length == 0)
            return Result<string>.Failure("File is empty");
        
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(request.File.Name).ToLowerInvariant();
        if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
            return Result<string>.Failure("Unsupported file type");
        
        var newFileName = $"{request.UserId}{fileExtension}";

        if (request.File.Content.Length > 5 * 1024 * 1024) // 5 MB limit
            return Result<string>.Failure("File size exceeds the limit of 5 MB");
        try
        {
            var fileUrl = await _fileService.SaveFileAsync(
                newFileName,
                request.File.Content,
                null!,
                cancellationToken);
            return Result<string>.Success(fileUrl);
        }
        catch (Exception ex)
        {
            // Log the exception (not implemented here)
            return Result<string>.Failure($"File upload failed: {ex.Message}");
        }
    }
}