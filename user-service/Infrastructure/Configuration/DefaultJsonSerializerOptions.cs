using System.Text.Json;
using System.Text.Json.Serialization;

namespace Infrastructure.Configuration;

public class DefaultJsonSerializerOptions
{
    public readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = null,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() }
    };
}