namespace Infrastructure.Configuration;

public class KafkaTopicsOptions
{
    public const string SectionName = "Kafka:Topics"; 

    public string NewMessage { get; set; } = string.Empty;
    public string EditMessage { get; set; } = string.Empty;
    public string DeleteMessage { get; set; } = string.Empty;
}