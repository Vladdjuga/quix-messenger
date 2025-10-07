using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositories;

public class MessageAttachmentRepository : IMessageAttachmentRepository
{
    private readonly MessengerDbContext _dbContext;
    private readonly DbSet<MessageAttachmentEntity> _dbSet;

    public MessageAttachmentRepository(MessengerDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<MessageAttachmentEntity>();
    }

    public async Task AddAsync(MessageAttachmentEntity attachment, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(attachment, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<MessageAttachmentEntity> attachments, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddRangeAsync(attachments, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<MessageAttachmentEntity?> GetByIdAsync(Guid attachmentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == attachmentId && !a.IsDeleted, cancellationToken);
    }

    public async Task<IEnumerable<MessageAttachmentEntity>> GetByMessageIdAsync(Guid messageId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(a => a.MessageId == messageId && !a.IsDeleted)
            .OrderBy(a => a.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MessageAttachmentEntity>> GetByChatIdAsync(Guid chatId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(a => a.Message)
            .Where(a => a.Message!.ChatId == chatId && !a.IsDeleted)
            .OrderByDescending(a => a.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MessageAttachmentEntity>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(a => a.Message)
            .Where(a => a.Message!.UserId == userId && !a.IsDeleted)
            .OrderByDescending(a => a.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<MessageAttachmentEntity>> GetByMimeTypeAsync(string mimeTypePattern, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(a => EF.Functions.Like(a.MimeType, mimeTypePattern) && !a.IsDeleted)
            .OrderByDescending(a => a.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(MessageAttachmentEntity attachment, CancellationToken cancellationToken = default)
    {
        _dbSet.Update(attachment);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task SoftDeleteAsync(Guid attachmentId, CancellationToken cancellationToken = default)
    {
        var attachment = await _dbSet.FindAsync([attachmentId], cancellationToken);
        if (attachment is not null)
        {
            attachment.IsDeleted = true;
            attachment.DeletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAsync(MessageAttachmentEntity attachment, CancellationToken cancellationToken = default)
    {
        _dbSet.Remove(attachment);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<long> GetTotalStorageSizeByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(a => a.Message)
            .Where(a => a.Message!.UserId == userId && !a.IsDeleted)
            .SumAsync(a => a.FileSize, cancellationToken);
    }

    public async Task<long> GetTotalStorageSizeByChatAsync(Guid chatId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(a => a.Message)
            .Where(a => a.Message!.ChatId == chatId && !a.IsDeleted)
            .SumAsync(a => a.FileSize, cancellationToken);
    }

    public async Task<IEnumerable<MessageAttachmentEntity>> GetOrphanedAttachmentsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(a => a.Message)
            .Where(a => a.Message == null)
            .ToListAsync(cancellationToken);
    }
}
