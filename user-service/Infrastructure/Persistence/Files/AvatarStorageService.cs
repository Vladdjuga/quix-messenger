using Application.Interfaces;

namespace Infrastructure.Persistence.Files;

public class AvatarStorageService:PhysicalFileStorageService, IAvatarStorageService
{
    public AvatarStorageService(string webRoot, string baseFolder) : base(webRoot, baseFolder)
    { }
}