using Domain.Entities;

namespace Domain.Repositories;

public interface IMessageAttachmentRepository
{
    Task AddAsync(MessageAttachmentEntity attachment, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<MessageAttachmentEntity> attachments, CancellationToken cancellationToken = default);
    Task<MessageAttachmentEntity?> GetByIdAsync(Guid attachmentId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MessageAttachmentEntity>> GetByMessageIdAsync(Guid messageId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MessageAttachmentEntity>> GetByChatIdAsync(Guid chatId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MessageAttachmentEntity>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MessageAttachmentEntity>> GetByMimeTypeAsync(string mimeTypePattern, CancellationToken cancellationToken = default);
    Task UpdateAsync(MessageAttachmentEntity attachment, CancellationToken cancellationToken = default);
    Task SoftDeleteAsync(Guid attachmentId, CancellationToken cancellationToken = default);
    Task DeleteAsync(MessageAttachmentEntity attachment, CancellationToken cancellationToken = default);
    Task<long> GetTotalStorageSizeByUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<long> GetTotalStorageSizeByChatAsync(Guid chatId, CancellationToken cancellationToken = default);
    Task<IEnumerable<MessageAttachmentEntity>> GetOrphanedAttachmentsAsync(CancellationToken cancellationToken = default);
}
