namespace Application.Interfaces;

public interface IUserDefaults
{
    string DefaultAvatar { get; }
    int MaxAvatarSizeInBytes { get; }
    string[] AllowedAvatarFileExtensions { get; }
    IReadOnlyDictionary<string, string> AvatarContentTypes { get; }
}