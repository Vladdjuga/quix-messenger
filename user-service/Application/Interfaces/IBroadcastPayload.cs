namespace Application.Interfaces;

public interface IBroadcastPayload
{
    string GetEventType();
    string GetPartitionKey();
    Dictionary<string, object> GetLogMetadata();
}