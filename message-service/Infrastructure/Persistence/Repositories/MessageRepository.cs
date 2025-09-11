using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence.Mongo;
using MongoDB.Driver;

namespace Infrastructure.Persistence.Repositories;

public class MessageRepository:IMessageRepository
{
    private readonly MongoDbContext _dbContext;

    public MessageRepository(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task AddMessageAsync(MessageEntity message)
    {
        await _dbContext.Messages.InsertOneAsync(message);
    }

    public async Task AddMessageAsync(IEnumerable<MessageEntity> messages)
    {
        await _dbContext.Messages.InsertManyAsync(messages);
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesAsync()
    {
        var messages=await _dbContext.Messages.Find(_=>true).ToListAsync();
        return messages;
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesByChatIdAsync(Guid chatId)
    {
        var filter= Builders<MessageEntity>.Filter.Eq(m => m.ChatId, chatId);
        var messages=await _dbContext.Messages.Find(filter).ToListAsync();
        return messages;
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesAsync(Guid? userId, Guid? chatId,int count,
        CancellationToken cancellationToken)
    {
        var filter = Builders<MessageEntity>.Filter.Empty;
        if(userId.HasValue)
            filter &= Builders<MessageEntity>.Filter.Eq(m => m.UserId, userId.Value);
        if(chatId.HasValue)
            filter &= Builders<MessageEntity>.Filter.Eq(m => m.ChatId, chatId.Value);
        var messages=await _dbContext.Messages.Find(filter)
            .Sort(Builders<MessageEntity>.Sort.Descending(m => m.SentAt))
            .Limit(count)
            .ToListAsync(cancellationToken);
        return messages;
    }

    public async Task<IEnumerable<MessageEntity>> GetMessagesPaginatedAsync(Guid? userId, Guid? chatId, 
        DateTime lastCreatedAt,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var filter = Builders<MessageEntity>.Filter.Empty;
        if(userId.HasValue)
            filter &= Builders<MessageEntity>.Filter.Eq(m => m.UserId, userId.Value);
        if(chatId.HasValue)
            filter &= Builders<MessageEntity>.Filter.Eq(m => m.ChatId, chatId.Value);
        filter &= Builders<MessageEntity>.Filter.Lt(m => m.SentAt, lastCreatedAt);
        var messages=await _dbContext.Messages.Find(filter)
            .Sort(Builders<MessageEntity>.Sort.Descending(m => m.SentAt))
            .Limit(pageSize)
            .ToListAsync(cancellationToken);
        return messages;
    }
}