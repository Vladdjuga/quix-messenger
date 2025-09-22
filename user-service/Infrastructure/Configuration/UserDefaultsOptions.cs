using Application.Interfaces;

namespace Infrastructure.Configuration;

public class UserDefaultsOptions:IUserDefaults
{
    public const string SectionName = "UserDefaults";
    public string DefaultAvatar { get; set; } = "default-avatar.png"; // Default avatar filename, but can be configured
    public int MaxAvatarSizeInBytes { get; } = 5 * 1024 * 1024; // 5 MB as default, but can be configured
    public string[] AllowedAvatarFileExtensions { get; } = new []{".jpg", ".jpeg", ".png", ".gif" }; // Default allowed extensions, but can be configured
}