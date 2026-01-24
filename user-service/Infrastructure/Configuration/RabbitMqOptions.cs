namespace Infrastructure.Configuration;

/// <summary>
/// Configuration options for RabbitMQ connection
/// </summary>
public class RabbitMqOptions
{
    public const string SectionName = "RabbitMQ";
    
    public string Host { get; set; } = "localhost";
    public ushort Port { get; set; } = 5672;
    public string VirtualHost { get; set; } = "/";
    public string Username { get; set; } = "guest";
    public string Password { get; set; } = "guest";
    
    /// <summary>
    /// Connection string format: amqp://username:password@host:port/virtualHost
    /// </summary>
    public string GetConnectionString() => 
        $"amqp://{Username}:{Password}@{Host}:{Port}{VirtualHost}";
}
