namespace Infrastructure.Configuration;

public class FileStorageOptions
{
    public const string SectionName = "FileStorage";
    public string AvatarStoragePath { get; set; } = "/var/lib/quix-messenger/avatars";
}