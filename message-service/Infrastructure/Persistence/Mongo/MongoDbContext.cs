using Domain.Entities;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace Infrastructure.Persistence.Mongo;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDb"));
        _database = client.GetDatabase(config.GetConnectionString("MongoDbName"));
    }

    public IMongoCollection<MessageEntity> Messages=> _database.GetCollection<MessageEntity>("Messages");
}