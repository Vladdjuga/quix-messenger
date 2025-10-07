using Application.Interfaces;

namespace Infrastructure.Persistence.Files;

public class MessageAttachmentStorageService : PhysicalFileStorageService, IMessageAttachmentStorageService
{
    public MessageAttachmentStorageService(string webRoot, string baseFolder) : base(webRoot, baseFolder)
    {
    }
}
