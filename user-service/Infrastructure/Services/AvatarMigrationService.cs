using Application.Interfaces;
using Infrastructure.Configuration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class AvatarMigrationService
{
    private readonly ILogger<AvatarMigrationService> _logger;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly FileStorageOptions _fileStorageOptions;

    public AvatarMigrationService(
        ILogger<AvatarMigrationService> logger,
        IWebHostEnvironment webHostEnvironment,
        IOptions<FileStorageOptions> fileStorageOptions)
    {
        _logger = logger;
        _webHostEnvironment = webHostEnvironment;
        _fileStorageOptions = fileStorageOptions.Value;
    }

    public async Task MigrateDefaultAssetsAsync(CancellationToken cancellationToken = default)
    {
        if (!_fileStorageOptions.MigrateDefaultAssetsOnStartup)
        {
            _logger.LogInformation("Avatar migration is disabled in configuration");
            return;
        }
        try
        {
            await EnsureDefaultAvatarExistsAsync(cancellationToken);
            _logger.LogInformation("Avatar migration completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to migrate default avatar assets");
            throw;
        }
    }

    private async Task EnsureDefaultAvatarExistsAsync(CancellationToken cancellationToken)
    {
        const string defaultAvatarFileName = "default-avatar.jpg";
        
        // Source path (current wwwroot location)
        var sourcePath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "avatars", defaultAvatarFileName);
        
        // Destination path (new storage location)
        var destinationPath = Path.Combine(_fileStorageOptions.AvatarStoragePath, defaultAvatarFileName);

        // Ensure destination directory exists
        var destinationDirectory = Path.GetDirectoryName(destinationPath);
        if (destinationDirectory != null && !Directory.Exists(destinationDirectory))
        {
            Directory.CreateDirectory(destinationDirectory);
            _logger.LogInformation("Created avatar storage directory: {Directory}", destinationDirectory);
        }

        // Copy default avatar if it doesn't exist in the new location
        if (!File.Exists(destinationPath))
        {
            if (File.Exists(sourcePath))
            {
                await using var sourceStream = new FileStream(sourcePath, FileMode.Open, FileAccess.Read);
                await using var destinationStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write);
                await sourceStream.CopyToAsync(destinationStream, cancellationToken);
                
                _logger.LogInformation("Copied default avatar from {Source} to {Destination}", sourcePath, destinationPath);
            }
            else
            {
                _logger.LogWarning("Default avatar not found at source location: {Source}", sourcePath);
                
                // Create a simple placeholder if source doesn't exist
                await CreatePlaceholderAvatarAsync(destinationPath, cancellationToken);
            }
        }
        else
        {
            _logger.LogDebug("Default avatar already exists at: {Destination}", destinationPath);
        }
    }

    private async Task CreatePlaceholderAvatarAsync(string destinationPath, CancellationToken cancellationToken)
    {
        // Create a simple placeholder file (you might want to embed a real default image)
        var placeholderContent = "Default avatar placeholder"u8.ToArray();
        await File.WriteAllBytesAsync(destinationPath, placeholderContent, cancellationToken);
        
        _logger.LogInformation("Created placeholder default avatar at: {Destination}", destinationPath);
    }
}
