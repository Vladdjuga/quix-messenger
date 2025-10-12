using System.Text.Json;
using Application.Interfaces;
using Confluent.Kafka;
using Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class KafkaProducerService : IKafkaProducerService, IDisposable
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaProducerService> _logger;
    private readonly DefaultJsonSerializerOptions _jsonOptions;

    public KafkaProducerService(IConfiguration configuration, ILogger<KafkaProducerService> logger,
        IOptions<DefaultJsonSerializerOptions> jsonOptions)
    {
        _logger = logger;
        _jsonOptions = jsonOptions.Value;

        var config = new ProducerConfig
        {
            BootstrapServers = configuration["Kafka:BootstrapServers"] ?? "kafka:9092",
            ClientId = "user-service-producer",
            Acks = Acks.All, // Required when EnableIdempotence is true
            EnableIdempotence = true,
            MaxInFlight = 5,
            CompressionType = CompressionType.Gzip,
            LingerMs = 10,
            RetryBackoffMs = 100,
        };

        _producer = new ProducerBuilder<string, string>(config)
            .SetKeySerializer(Serializers.Utf8)
            .SetValueSerializer(Serializers.Utf8)
            .SetErrorHandler((_, error) => 
            {
                _logger.LogError("Kafka producer error: {Reason}", error.Reason);
            })
            .Build();

        _logger.LogInformation("Kafka producer initialized with bootstrap servers: {Servers}", 
            config.BootstrapServers);
    }

    public async Task PublishAsync<T>(string topic, string key, T message, CancellationToken cancellationToken = default)
        where T : notnull
    {
        try
        {
            var messageJson = JsonSerializer.Serialize(message,message.GetType(), _jsonOptions.Options);
            
            // Log the serialized payload for debugging
            _logger.LogDebug("Serialized Kafka message: {Json}", messageJson);
            
            var kafkaMessage = new Message<string, string>
            {
                Key = key,
                Value = messageJson,
                Headers = new Headers
                {
                    { "content-type", "application/json"u8.ToArray() },
                    { "timestamp", BitConverter.GetBytes(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()) }
                }
            };

            var deliveryResult = await _producer.ProduceAsync(topic, kafkaMessage, cancellationToken);

            if (deliveryResult.Status == PersistenceStatus.Persisted)
            {
                _logger.LogInformation(
                    "Message published to Kafka: Topic={Topic}, Partition={Partition}, Offset={Offset}, Key={Key}",
                    deliveryResult.Topic,
                    deliveryResult.Partition.Value,
                    deliveryResult.Offset.Value,
                    key
                );
            }
            else
            {
                _logger.LogWarning(
                    "Message not persisted to Kafka: Topic={Topic}, Status={Status}, Key={Key}",
                    topic,
                    deliveryResult.Status,
                    key
                );
            }
        }
        catch (ProduceException<string, string> ex)
        {
            _logger.LogError(ex, 
                "Failed to publish message to Kafka: Topic={Topic}, Key={Key}, Error={Error}",
                topic,
                key,
                ex.Error.Reason
            );
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error publishing to Kafka: Topic={Topic}, Key={Key}", topic, key);
            throw;
        }
    }

    public void Dispose()
    {
        try
        {
            _logger.LogInformation("Flushing and disposing Kafka producer...");
            _producer?.Flush(TimeSpan.FromSeconds(10));
            _producer?.Dispose();
            _logger.LogInformation("Kafka producer disposed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disposing Kafka producer");
        }
    }
}